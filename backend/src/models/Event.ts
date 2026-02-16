import { eq, ilike, and, sql } from 'drizzle-orm';
import { db, events, eventRegistrations } from '../db';

// Types derived from Drizzle schema
type Event = typeof events.$inferSelect;
type EventInsert = typeof events.$inferInsert;

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
}): Promise<Event[]> => {
    const conditions = [];

    if (filters?.sport) {
        conditions.push(ilike(events.sport, filters.sport));
    }
    if (filters?.status) {
        conditions.push(
            eq(events.status, filters.status.toUpperCase() as any)
        );
    }

    if (conditions.length > 0) {
        return db.select().from(events).where(and(...conditions));
    }

    return db.select().from(events);
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
): Promise<Event | null> => {
    const event = await findEventById(eventId);
    if (!event) return null;

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
        throw new Error('User already registered for this event');
    }

    // Check capacity
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));

    if (count >= event.maxParticipants) {
        throw new Error('Event is full');
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
