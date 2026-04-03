import { eq, ilike, and } from 'drizzle-orm';
import { db, venues, venueBookings, events } from '../db';

// Types derived from Drizzle schema
type Venue = typeof venues.$inferSelect;
type VenueInsert = typeof venues.$inferInsert;

// ─── CRUD Operations (PostgreSQL via Drizzle) ────────────────────────────────

export const createVenue = async (data: {
    name: string;
    location: string;
    sports?: string[];
    amenities?: string[];
    pricePerHour: number;
    operatingHours?: Record<string, string>;
    images?: string[];
}): Promise<Venue> => {
    const [venue] = await db
        .insert(venues)
        .values({
            name: data.name,
            location: data.location,
            sports: data.sports ?? [],
            amenities: data.amenities ?? [],
            pricePerHour: String(data.pricePerHour),
            operatingHours: data.operatingHours ?? {},
            images: data.images ?? [],
        })
        .returning();

    console.log(`✅ Venue created in DB: ${venue.id} (${venue.name})`);
    return venue;
};

export const findVenueById = async (id: string): Promise<Venue | undefined> => {
    const [venue] = await db
        .select()
        .from(venues)
        .where(eq(venues.id, id))
        .limit(1);

    return venue;
};

export const getAllVenues = async (filters?: {
    sport?: string;
    location?: string;
}): Promise<Venue[]> => {
    // For now, return all and filter in JS since array contains is tricky
    let allVenues = await db.select().from(venues);

    if (filters?.sport) {
        allVenues = allVenues.filter((v) =>
            v.sports.some((s) => s.toLowerCase() === filters.sport!.toLowerCase())
        );
    }

    if (filters?.location) {
        allVenues = allVenues.filter((v) =>
            v.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
    }

    return allVenues;
};

export const updateVenue = async (
    id: string,
    data: Partial<Omit<VenueInsert, 'id' | 'createdAt'>>
): Promise<Venue | null> => {
    const [updated] = await db
        .update(venues)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(venues.id, id))
        .returning();

    return updated ?? null;
};

export const deleteVenue = async (id: string): Promise<boolean> => {
    // Cascade delete related records first due to restrict constraints
    await db.delete(venueBookings).where(eq(venueBookings.venueId, id));
    await db.delete(events).where(eq(events.venueId, id));
    
    const result = await db.delete(venues).where(eq(venues.id, id)).returning();
    return result.length > 0;
};
