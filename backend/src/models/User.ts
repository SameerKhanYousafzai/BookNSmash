import { User } from '../types';
import { hashPassword } from '../services/password';

// In-memory user storage
const users: User[] = [];

// Initialize with admin user
(async () => {
    const adminHash = await hashPassword('admin123');
    users.push({
        id: 'admin-001',
        name: 'Admin',
        email: 'admin@booknsmash.com',
        passwordHash: adminHash,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
    });
})();

// Helper to generate unique ID
let userIdCounter = 1;
const generateUserId = (): string => {
    return `user-${String(userIdCounter++).padStart(6, '0')}`;
};

// CRUD operations
export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
}): Promise<User> => {
    const passwordHash = await hashPassword(data.password);
    const user: User = {
        id: generateUserId(),
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    users.push(user);
    return user;
};

export const findUserByEmail = (email: string): User | undefined => {
    return users.find((u) => u.email === email.toLowerCase());
};

export const findUserById = (id: string): User | undefined => {
    return users.find((u) => u.id === id);
};

export const updateUser = (id: string, data: Partial<Pick<User, 'name' | 'email'>>): User | null => {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
        ...users[userIndex],
        ...data,
        updatedAt: new Date(),
    };
    return users[userIndex];
};

export const getAllUsers = (): User[] => {
    return users;
};

export const deleteUser = (id: string): boolean => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
};

// Helper to get user without password hash
export const sanitizeUser = (user: User) => {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
};
