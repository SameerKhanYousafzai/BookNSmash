import { eq } from 'drizzle-orm';
import { db, users } from '../db';
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

export const getAllUsers = async (): Promise<User[]> => {
    return db.select().from(users);
};

export const deleteUser = async (id: string): Promise<boolean> => {
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
