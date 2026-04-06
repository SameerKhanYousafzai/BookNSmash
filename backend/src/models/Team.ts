import { eq, ilike, and, sql } from 'drizzle-orm';
import { db, teams, teamMembers, users } from '../db';

// Types derived from Drizzle schema
type Team = typeof teams.$inferSelect & { memberIds?: string[] };
type TeamInsert = typeof teams.$inferInsert;

// ─── internal helper ─────────────────────────────────────────────────────────

const attachMembers = async (team: typeof teams.$inferSelect): Promise<Team> => {
    const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));
    return { ...team, memberIds: members.map(m => m.userId) };
};

// ─── CRUD Operations (PostgreSQL via Drizzle) ────────────────────────────────

export const createTeam = async (data: {
    name: string;
    captainId: string;
    sport: string;
}): Promise<Team> => {
    return await db.transaction(async (tx) => {
        // Check if captain already has a team in this sport
        const [existing] = await tx
            .select()
            .from(teams)
            .where(
                and(
                    eq(teams.captainId, data.captainId),
                    eq(teams.sport, data.sport)
                )
            )
            .limit(1);

        if (existing) {
            throw new Error('User already has a team in this sport');
        }

        const [team] = await tx
            .insert(teams)
            .values({
                name: data.name,
                captainId: data.captainId,
                sport: data.sport,
                wins: 0,
                losses: 0,
            })
            .returning();

        // Add captain as a member
        await tx.insert(teamMembers).values({
            teamId: team.id,
            userId: data.captainId
        });

        console.log(`✅ Team created in DB: ${team.id} (${team.name})`);
        return { ...team, memberIds: [data.captainId] };
    });
};

export const findTeamById = async (id: string): Promise<Team | undefined> => {
    const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, id))
        .limit(1);

    if (!team) return undefined;
    return await attachMembers(team);
};

export const getAllTeams = async (filters?: {
    sport?: string;
    limit?: number;
    page?: number;
}): Promise<any[]> => {
    const limitNum = filters?.limit || 20;
    const pageNum = filters?.page || 1;
    const offsetNum = (pageNum - 1) * limitNum;

    // Single query joining users for captain name and team_members for member count.
    const query = db
        .select({
            id: teams.id,
            name: teams.name,
            sport: teams.sport,
            wins: teams.wins,
            losses: teams.losses,
            description: teams.description,
            createdAt: teams.createdAt,
            updatedAt: teams.updatedAt,
            captainId: teams.captainId,
            captain: users.name,
            members: sql<number>`count(distinct ${teamMembers.userId})::int`,
        })
        .from(teams)
        .leftJoin(users, eq(teams.captainId, users.id))
        .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
        .limit(limitNum)
        .offset(offsetNum)
        .groupBy(teams.id, users.id, users.name);

    if (filters?.sport) {
        query.where(ilike(teams.sport, filters.sport));
    }

    return await query;
};

export const updateTeam = async (
    id: string,
    data: Partial<Pick<TeamInsert, 'name' | 'wins' | 'losses'>>
): Promise<Team | null> => {
    const [updated] = await db
        .update(teams)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(teams.id, id))
        .returning();

    if (!updated) return null;
    return await attachMembers(updated);
};

export const deleteTeam = async (id: string): Promise<boolean> => {
    const result = await db.delete(teams).where(eq(teams.id, id)).returning();
    return result.length > 0;
};

// ─── Member Management ───────────────────────────────────────────────────────

export const addTeamMember = async (
    teamId: string,
    userId: string
): Promise<Team | null> => {
    return await db.transaction(async (tx) => {
        const [team] = await tx.select().from(teams).where(eq(teams.id, teamId)).limit(1);
        if (!team) return null;

        // Check if user is already a member
        const [existingMember] = await tx.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        ).limit(1);

        if (existingMember) {
            throw new Error('User is already a member of this team');
        }

        // Check if user has another team in same sport
        const userOtherTeams = await tx.select({ id: teamMembers.teamId })
            .from(teamMembers)
            .where(eq(teamMembers.userId, userId));
            
        if (userOtherTeams.length > 0) {
            const teamIds = userOtherTeams.map(t => t.id);
            // We just need one query to verify sport overlapping
            // Simple check: is there a team among userOtherTeams matching team.sport?
            // Note: Since sport is on `teams`, we'll just query `teams` instead of doing joins
            const allUserTeams = await tx.select().from(teams).where(ilike(teams.sport, team.sport));
            const hasSameSport = allUserTeams.some(t => teamIds.includes(t.id));

            if (hasSameSport) {
                throw new Error('User already belongs to another team in this sport');
            }
        }

        await tx.insert(teamMembers).values({
            teamId,
            userId
        });

        // We update the team modified timestamp
        const [updated] = await tx.update(teams).set({ updatedAt: new Date() }).where(eq(teams.id, teamId)).returning();
        
        const members = await tx.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
        return { ...updated, memberIds: members.map(m => m.userId) };
    });
};

export const removeTeamMember = async (
    teamId: string,
    userId: string
): Promise<Team | null> => {
    return await db.transaction(async (tx) => {
        const [team] = await tx.select().from(teams).where(eq(teams.id, teamId)).limit(1);
        if (!team) return null;

        if (userId === team.captainId) {
            throw new Error('Cannot remove team captain. Transfer captaincy first or delete the team');
        }

        const deleteResult = await tx.delete(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        ).returning();

        if (deleteResult.length === 0) {
            throw new Error('User is not a member of this team');
        }

        const [updated] = await tx.update(teams).set({ updatedAt: new Date() }).where(eq(teams.id, teamId)).returning();
        const members = await tx.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
        return { ...updated, memberIds: members.map(m => m.userId) };
    });
};

export const isTeamCaptain = async (
    teamId: string,
    userId: string
): Promise<boolean> => {
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    return team?.captainId === userId;
};
