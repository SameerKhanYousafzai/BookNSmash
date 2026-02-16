import { eq, ilike, and, sql } from 'drizzle-orm';
import { db, teams } from '../db';

// Types derived from Drizzle schema
type Team = typeof teams.$inferSelect;
type TeamInsert = typeof teams.$inferInsert;

// ─── CRUD Operations (PostgreSQL via Drizzle) ────────────────────────────────

export const createTeam = async (data: {
    name: string;
    captainId: string;
    sport: string;
}): Promise<Team> => {
    // Check if captain already has a team in this sport (unique constraint will also catch this)
    const [existing] = await db
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

    const [team] = await db
        .insert(teams)
        .values({
            name: data.name,
            captainId: data.captainId,
            memberIds: [data.captainId], // Captain is automatically a member
            sport: data.sport,
            wins: 0,
            losses: 0,
        })
        .returning();

    console.log(`✅ Team created in DB: ${team.id} (${team.name})`);
    return team;
};

export const findTeamById = async (id: string): Promise<Team | undefined> => {
    const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, id))
        .limit(1);

    return team;
};

export const getAllTeams = async (filters?: {
    sport?: string;
}): Promise<Team[]> => {
    if (filters?.sport) {
        return db
            .select()
            .from(teams)
            .where(ilike(teams.sport, filters.sport));
    }

    return db.select().from(teams);
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

    return updated ?? null;
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
    const team = await findTeamById(teamId);
    if (!team) return null;

    if (team.memberIds.includes(userId)) {
        throw new Error('User is already a member of this team');
    }

    // Check if user already has a team in this sport
    const allTeams = await db.select().from(teams).where(eq(teams.sport, team.sport));
    const userTeam = allTeams.find(
        (t) => t.id !== teamId && t.memberIds.includes(userId)
    );

    if (userTeam) {
        throw new Error('User already belongs to another team in this sport');
    }

    const [updated] = await db
        .update(teams)
        .set({
            memberIds: [...team.memberIds, userId],
            updatedAt: new Date(),
        })
        .where(eq(teams.id, teamId))
        .returning();

    return updated ?? null;
};

export const removeTeamMember = async (
    teamId: string,
    userId: string
): Promise<Team | null> => {
    const team = await findTeamById(teamId);
    if (!team) return null;

    if (userId === team.captainId) {
        throw new Error(
            'Cannot remove team captain. Transfer captaincy first or delete the team'
        );
    }

    if (!team.memberIds.includes(userId)) {
        throw new Error('User is not a member of this team');
    }

    const [updated] = await db
        .update(teams)
        .set({
            memberIds: team.memberIds.filter((id) => id !== userId),
            updatedAt: new Date(),
        })
        .where(eq(teams.id, teamId))
        .returning();

    return updated ?? null;
};

export const isTeamCaptain = async (
    teamId: string,
    userId: string
): Promise<boolean> => {
    const team = await findTeamById(teamId);
    return team?.captainId === userId;
};
