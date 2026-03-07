export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    sport: string;
    startDate: Date;
    endDate: Date;
    entryFee: number;
    maxParticipants: number;
    venueId: string;
    registeredUserIds: string[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface Venue {
    id: string;
    name: string;
    location: string;
    sports: string[];
    amenities: string[];
    pricePerHour: number;
    images: string[];
    operatingHours: {
        open: string;
        close: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Team {
    id: string;
    name: string;
    captainId: string;
    memberIds: string[];
    sport: string;
    wins: number;
    losses: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthTokenPayload {
    userId: string;
    role: 'USER' | 'ADMIN';
    name: string;
}

export interface RefreshTokenPayload {
    userId: string;
}

// Express Request extension
declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}
