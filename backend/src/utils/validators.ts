import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// User validators
export const updateUserSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
});

// Event validators
export const createEventSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().max(1000).optional(),
    sport: z.string().min(1, 'Sport is required'),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    entryFee: z.number().min(0, 'Entry fee must be non-negative'),
    maxParticipants: z.number().min(1, 'Must allow at least 1 participant'),
    venueId: z.string().min(1, 'Venue ID is required'),
});

export const updateEventSchema = createEventSchema.partial();

// Venue validators
export const createVenueSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    location: z.string().min(5, 'Location must be at least 5 characters'),
    sports: z.array(z.string()).min(1, 'At least one sport is required'),
    amenities: z.array(z.string()),
    pricePerHour: z.number().min(0, 'Price must be non-negative'),
    images: z.array(z.string()).optional(),
    operatingHours: z.object({
        open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    }),
});

export const updateVenueSchema = createVenueSchema.partial();

// Team validators
export const createTeamSchema = z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters').max(50),
    sport: z.string().min(1, 'Sport is required'),
});

export const updateTeamSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    wins: z.number().min(0).optional(),
    losses: z.number().min(0).optional(),
});

export const addTeamMemberSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
});

// Venue Booking validators
export const createVenueBookingSchema = z.object({
    startTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start time'),
    endTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end time'),
});

// Shop validators
export const checkoutSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1)
    })).min(1, 'Cart cannot be empty')
});

// Password Reset validators
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

