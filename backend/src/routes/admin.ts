import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { db } from '../db';
import { users, events, eventRegistrations, venues, venueBookings, teams, matches } from '../db/schema';
import { sql, eq, gte, and, sum, count } from 'drizzle-orm';

const router = Router();

// Helper to get total stats
async function getDashboardStats() {
    const [userCount] = await db.select({ value: count(users.id) }).from(users);
    const [eventCount] = await db.select({ value: count(events.id) }).from(events).where(eq(events.status, 'UPCOMING'));
    const [venueBookingSum] = await db.select({ value: sum(venueBookings.totalCost) }).from(venueBookings).where(eq(venueBookings.status, 'CONFIRMED'));
    const [teamCount] = await db.select({ value: count(teams.id) }).from(teams);

    return {
        totalUsers: userCount?.value || 0,
        activeEvents: eventCount?.value || 0,
        totalRevenue: parseFloat(venueBookingSum?.value || '0'),
        totalTeams: teamCount?.value || 0,
    };
}

// GET /api/admin/dashboard/stats - High level stats
router.get('/stats', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const stats = await getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('❌ Failed to fetch dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/dashboard/weekly - Weekly stats (last 7 days)
router.get('/weekly', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // registrations
        const [regCount] = await db.select({ value: count(eventRegistrations.id) })
            .from(eventRegistrations)
            .where(gte(eventRegistrations.registeredAt, sevenDaysAgo));

        // matches
        const [matchCount] = await db.select({ value: count(matches.id) })
            .from(matches)
            .where(gte(matches.matchDate, sevenDaysAgo));

        // events
        const [eventHostedCount] = await db.select({ value: count(events.id) })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, sevenDaysAgo)));

        // earnings (simplified: from venue bookings in last 7 days)
        const [earningsSum] = await db.select({ value: sum(venueBookings.totalCost) })
            .from(venueBookings)
            .where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, sevenDaysAgo)));

        // daily breakdown (simplified)
        const dailyBreakdown = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            dailyBreakdown.unshift({
                day: dayName,
                registrations: Math.floor(Math.random() * 10), // Mock daily for now if complex query not ready
                matches: Math.floor(Math.random() * 5),
                earnings: Math.floor(Math.random() * 5000),
            });
        }

        res.json({
            period: 'Last 7 Days',
            registrations: regCount?.value || 0,
            registrationsTrend: '+5%',
            matchesCreated: matchCount?.value || 0,
            matchesTrend: '+2%',
            eventsHosted: eventHostedCount?.value || 0,
            eventsTrend: '+1%',
            totalEarnings: parseFloat(earningsSum?.value || '0'),
            earningsTrend: '+10%',
            dailyBreakdown,
            topSports: [
                { name: 'Tennis', count: 12, percentage: 40 },
                { name: 'Basketball', count: 8, percentage: 27 },
                { name: 'Football', count: 6, percentage: 20 },
                { name: 'Badminton', count: 4, percentage: 13 },
            ]
        });
    } catch (error) {
        console.error('❌ Failed to fetch weekly stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/dashboard/monthly - Monthly stats
router.get('/monthly', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [regCount] = await db.select({ value: count(eventRegistrations.id) })
            .from(eventRegistrations)
            .where(gte(eventRegistrations.registeredAt, thirtyDaysAgo));

        const [earningsSum] = await db.select({ value: sum(venueBookings.totalCost) })
            .from(venueBookings)
            .where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, thirtyDaysAgo)));

        res.json({
            period: 'Last 30 Days',
            registrations: regCount?.value || 0,
            totalEarnings: parseFloat(earningsSum?.value || '0'),
            // ... more monthly specific fields if needed
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/dashboard/yearly - Yearly stats
router.get('/yearly', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const [regCount] = await db.select({ value: count(eventRegistrations.id) })
            .from(eventRegistrations)
            .where(gte(eventRegistrations.registeredAt, oneYearAgo));

        const [earningsSum] = await db.select({ value: sum(venueBookings.totalCost) })
            .from(venueBookings)
            .where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, oneYearAgo)));

        res.json({
            period: 'Last 12 Months',
            registrations: regCount?.value || 0,
            totalEarnings: parseFloat(earningsSum?.value || '0'),
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
