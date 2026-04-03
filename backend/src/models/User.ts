import { eq, and, gt, count, or } from 'drizzle-orm';
import { db, users, teams, matches } from '../db';
import { hashPassword } from '../services/password';

// Type derived from Drizzle schema
type User = typeof users.$inferSelect;

// ─── CRUD Operations (PostgreSQL via Drizzle) ────────────────────────────────

export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
}): Promise<User> => {
    const passwordHash = await hashPassword(data.password);

    try {
        const [user] = await db
            .insert(users)
            .values({
                name: data.name,
                email: data.email.toLowerCase(),
                passwordHash,
                role: 'USER',
            })
            .returning();

        console.log(`✅ User created in DB: ${user.id} (${user.email})`);
        return user;
    } catch (error) {
        console.error('❌ FAILED to insert user into database:', error);
        throw error;
    }
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    return user;
};

export const findUserById = async (id: string): Promise<User | undefined> => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return user;
};

export const updateUser = async (
    id: string,
    data: { name?: string; email?: string }
): Promise<User | null> => {
    const [updated] = await db
        .update(users)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

    return updated ?? null;
};

export const setResetToken = async (id: string, token: string, expiry: Date): Promise<void> => {
    await db.update(users).set({
        resetToken: token,
        resetTokenExpiry: expiry,
        updatedAt: new Date()
    }).where(eq(users.id, id));
};

export const findUserByResetToken = async (token: string): Promise<User | undefined> => {
    const [user] = await db.select().from(users).where(
        and(
            eq(users.resetToken, token),
            gt(users.resetTokenExpiry, new Date())
        )
    ).limit(1);
    return user;
};

export const updatePassword = async (id: string, newPasswordRaw: string): Promise<void> => {
    const passwordHash = await hashPassword(newPasswordRaw);
    await db.update(users).set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
    }).where(eq(users.id, id));
};

export const getAllUsers = async (limit: number = 100, offset: number = 0): Promise<User[]> => {
    return db.select().from(users).limit(limit).offset(offset);
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return false;

    if (user.role === 'ADMIN') {
        const [adminCount] = await db.select({ value: count(users.id) }).from(users).where(eq(users.role, 'ADMIN'));
        if (Number(adminCount.value) <= 1) {
            throw new Error('Cannot delete the last admin user');
        }
    }

    // Find all teams where user is captain
    const userTeams = await db.select({ id: teams.id }).from(teams).where(eq(teams.captainId, id));
    
    // For each team, delete any matches since matches to team constraint is 'restrict'
    for (const team of userTeams) {
        await db.delete(matches).where(
            or(eq(matches.team1Id, team.id), eq(matches.team2Id, team.id))
        );
    }

    // Now delete user (which cascades to teams, venueBookings, eventRegistrations)
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
};

// Helper to get user without password hash
export const sanitizeUser = (user: User) => {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
};

// Seed admin user if not exists
export const ensureAdminUser = async (): Promise<void> => {
    const existing = await findUserByEmail('admin@booknsmash.com');
    if (!existing) {
        const passwordHash = await hashPassword('admin123');
        await db.insert(users).values({
            name: 'Admin',
            email: 'admin@booknsmash.com',
            passwordHash,
            role: 'ADMIN',
        });
        console.log('✅ Admin user seeded in database');
    } else {
        console.log('ℹ️  Admin user already exists');
    }
};
