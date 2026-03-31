import { eq, ilike, and, sql, desc } from 'drizzle-orm';
import { db, events, eventRegistrations, users } from '../db';

// Types derived from Drizzle schema
type Event = typeof events.$inferSelect;
type EventInsert = typeof events.$inferInsert;

// Custom error class for registration errors
export class RegistrationError extends Error {
    constructor(
        message: string,
        public readonly code: 'DUPLICATE' | 'FULL' | 'NOT_FOUND'
    ) {
        super(message);
        this.name = 'RegistrationError';
    }
}

// ─── CRUD Operations (PostgreSQL via Drizzle) ────────────────────────────────

export const createEvent = async (data: {
    title: string;
    description?: string;
    sport: string;
    startDate: Date;
    endDate: Date;
    venueId: string;
    maxParticipants: number;
    entryFee?: number;
    status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}): Promise<Event> => {
    const [event] = await db
        .insert(events)
        .values({
            title: data.title,
            description: data.description ?? null,
            sport: data.sport,
            startDate: data.startDate,
            endDate: data.endDate,
            venueId: data.venueId,
            maxParticipants: data.maxParticipants,
            entryFee: String(data.entryFee ?? 0),
            status: data.status ?? 'UPCOMING',
        })
        .returning();

    console.log(`✅ Event created in DB: ${event.id} (${event.title})`);
    return event;
};

export const findEventById = async (id: string): Promise<Event | undefined> => {
    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1);

    return event;
};

export const getAllEvents = async (filters?: {
    sport?: string;
    status?: string;
    limit?: number;
    offset?: number;
}): Promise<{ events: Event[], total: number }> => {
    const conditions = [];

    if (filters?.sport) {
        conditions.push(ilike(events.sport, filters.sport));
    }
    if (filters?.status) {
        conditions.push(
            eq(events.status, filters.status.toUpperCase() as any)
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(whereClause);

    const rows = await db
        .select()
        .from(events)
        .where(whereClause)
        .limit(filters?.limit ?? 50)
        .offset(filters?.offset ?? 0);

    return { events: rows, total: count };
};

export const updateEvent = async (
    id: string,
    data: Partial<Omit<EventInsert, 'id' | 'createdAt'>>
): Promise<Event | null> => {
    const [updated] = await db
        .update(events)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning();

    return updated ?? null;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
};

// ─── Registration Operations (via event_registrations table) ─────────────────

export const registerUserForEvent = async (
    eventId: string,
    userId: string
): Promise<Event> => {
    const event = await findEventById(eventId);
    if (!event) {
        throw new RegistrationError('Event not found', 'NOT_FOUND');
    }

    // Check existing registration
    const [existing] = await db
        .select()
        .from(eventRegistrations)
        .where(
            and(
                eq(eventRegistrations.eventId, eventId),
                eq(eventRegistrations.userId, userId)
            )
        )
        .limit(1);

    if (existing) {
        throw new RegistrationError('User already registered for this event', 'DUPLICATE');
    }

    // Check capacity
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));

    if (count >= event.maxParticipants) {
        throw new RegistrationError('Event is full', 'FULL');
    }

    await db.insert(eventRegistrations).values({
        eventId,
        userId,
        status: 'REGISTERED',
    });

    console.log(`✅ User ${userId} registered for event ${eventId}`);
    return event;
};

export const unregisterUserFromEvent = async (
    eventId: string,
    userId: string
): Promise<Event | null> => {
    const event = await findEventById(eventId);
    if (!event) return null;

    const result = await db
        .delete(eventRegistrations)
        .where(
            and(
                eq(eventRegistrations.eventId, eventId),
                eq(eventRegistrations.userId, userId)
            )
        )
        .returning();

    if (result.length === 0) {
        throw new Error('User not registered for this event');
    }

    console.log(`✅ User ${userId} unregistered from event ${eventId}`);
    return event;
};

// ─── Admin: All registrations with user + event data ─────────────────────────

export const getAllRegistrations = async (filters?: {
    eventId?: string;
    status?: string;
    limit?: number;
    offset?: number;
}): Promise<{
    registrations: any[];
    total: number;
}> => {
    const conditions = [];

    if (filters?.eventId) {
        conditions.push(eq(eventRegistrations.eventId, filters.eventId));
    }
    if (filters?.status) {
        conditions.push(eq(eventRegistrations.status, filters.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(whereClause);

    // Get paginated results with joins
    const rows = await db
        .select({
            id: eventRegistrations.id,
            status: eventRegistrations.status,
            registeredAt: eventRegistrations.registeredAt,
            userId: eventRegistrations.userId,
            userName: users.name,
            userEmail: users.email,
            eventId: eventRegistrations.eventId,
            eventTitle: events.title,
            eventSport: events.sport,
            eventStartDate: events.startDate,
        })
        .from(eventRegistrations)
        .innerJoin(users, eq(eventRegistrations.userId, users.id))
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(whereClause)
        .orderBy(desc(eventRegistrations.registeredAt))
        .limit(filters?.limit ?? 50)
        .offset(filters?.offset ?? 0);

    return { registrations: rows, total: count };
};

// Get participant count for an event
export const getEventParticipantCount = async (eventId: string): Promise<number> => {
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));

    return count;
};
