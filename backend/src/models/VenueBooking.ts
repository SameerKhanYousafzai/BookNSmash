import { eq, and, or, sql } from 'drizzle-orm';
import { db, venueBookings, venues } from '../db';

export const createBooking = async (data: {
    userId: string;
    venueId: string;
    startTime: string;
    endTime: string;
}) => {
    // 1. Fetch Venue to calculate cost
    const [venue] = await db.select().from(venues).where(eq(venues.id, data.venueId)).limit(1);
    if (!venue) throw new Error('Venue not found');

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    if (start >= end) throw new Error('Start time must be before end time');

    // 2. Check for overlapping bookings
    const overlapping = await db.select()
        .from(venueBookings)
        .where(
            and(
                eq(venueBookings.venueId, data.venueId),
                eq(venueBookings.status, 'CONFIRMED'),
                or(
                    and(
                        sql`${venueBookings.startTime} <= ${start.toISOString()}::timestamp`,
                        sql`${venueBookings.endTime} > ${start.toISOString()}::timestamp`
                    ),
                    and(
                        sql`${venueBookings.startTime} < ${end.toISOString()}::timestamp`,
                        sql`${venueBookings.endTime} >= ${end.toISOString()}::timestamp`
                    ),
                    and(
                        sql`${venueBookings.startTime} >= ${start.toISOString()}::timestamp`,
                        sql`${venueBookings.endTime} <= ${end.toISOString()}::timestamp`
                    )
                )
            )
        );

    if (overlapping.length > 0) {
        throw new Error('Venue is already booked for this time slot');
    }

    // 3. Calculate Cost
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalCost = (hours * parseFloat(venue.pricePerHour)).toFixed(2);

    // 4. Create Booking
    const [booking] = await db.insert(venueBookings).values({
        userId: data.userId,
        venueId: data.venueId,
        startTime: start,
        endTime: end,
        totalCost,
        status: 'CONFIRMED', // Auto-confirm for this iteration
    }).returning();

    return booking;
};

export const getUserBookings = async (userId: string) => {
    return db.select().from(venueBookings).where(eq(venueBookings.userId, userId));
};

export const getVenueAvailability = async (venueId: string) => {
    return db.select()
        .from(venueBookings)
        .where(
            and(
                eq(venueBookings.venueId, venueId),
                eq(venueBookings.status, 'CONFIRMED'),
                sql`${venueBookings.endTime} > NOW()`
            )
        );
};
