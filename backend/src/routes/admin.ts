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
        const regRecords = await db.select({ registeredAt: eventRegistrations.registeredAt })
            .from(eventRegistrations)
            .where(gte(eventRegistrations.registeredAt, sevenDaysAgo));
        const regCount = regRecords.length;

        // matches
        const matchRecords = await db.select({ matchDate: matches.matchDate, sport: events.sport })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(gte(matches.matchDate, sevenDaysAgo));
        const matchCount = matchRecords.length;

        // events
        const eventRecords = await db.select({ endDate: events.endDate, sport: events.sport })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, sevenDaysAgo)));
        const eventHostedCount = eventRecords.length;

        // earnings (simplified: from venue bookings in last 7 days)
        const bookingRecords = await db.select({ totalCost: venueBookings.totalCost, createdAt: venueBookings.createdAt })
            .from(venueBookings)
            .where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, sevenDaysAgo)));
        const earningsSum = bookingRecords.reduce((sum, b) => sum + parseFloat(b.totalCost), 0);

        // Build daily breakdown dynamically to ensure true values
        const dailyMap = new Map();
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            dailyMap.set(dayName, { day: dayName, registrations: 0, matches: 0, earnings: 0 });
        }

        // Map DB records to map
        regRecords.forEach(r => {
            const dayName = new Date(r.registeredAt).toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyMap.has(dayName)) dailyMap.get(dayName).registrations += 1;
        });
        matchRecords.forEach(m => {
            const dayName = new Date(m.matchDate).toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyMap.has(dayName)) dailyMap.get(dayName).matches += 1;
        });
        bookingRecords.forEach(b => {
            const dayName = new Date(b.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyMap.has(dayName)) dailyMap.get(dayName).earnings += parseFloat(b.totalCost);
        });

        // Convert map to array ascending chronological
        const dailyBreakdown = Array.from(dailyMap.values()).reverse();

        // Calculate top sports correctly
        const sportCounts: Record<string, number> = {};
        matchRecords.forEach(m => { sportCounts[m.sport] = (sportCounts[m.sport] || 0) + 1; });
        eventRecords.forEach(e => { sportCounts[e.sport] = (sportCounts[e.sport] || 0) + 1; });
        
        const totalSportEntries = Object.values(sportCounts).reduce((a, b) => a + b, 0);
        const topSports = Object.entries(sportCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalSportEntries > 0 ? Math.round((count / totalSportEntries) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // top 5

        res.json({
            period: 'Last 7 Days',
            registrations: regCount,
            registrationsTrend: '+0%', // Trends are hardcoded until historical delta queries are requested
            matchesCreated: matchCount,
            matchesTrend: '+0%',
            eventsHosted: eventHostedCount,
            eventsTrend: '+0%',
            totalEarnings: earningsSum,
            earningsTrend: '+0%',
            dailyBreakdown,
            topSports
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

        const regRecords = await db.select({ registeredAt: eventRegistrations.registeredAt })
            .from(eventRegistrations)
            .where(gte(eventRegistrations.registeredAt, thirtyDaysAgo));
        const regCount = regRecords.length;

        const bookingRecords = await db.select({ totalCost: venueBookings.totalCost, createdAt: venueBookings.createdAt, venueId: venueBookings.venueId })
            .from(venueBookings)
            .where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, thirtyDaysAgo)));
        const earningsSum = bookingRecords.reduce((sum, b) => sum + parseFloat(b.totalCost), 0);

        const matchRecords = await db.select({ matchDate: matches.matchDate, sport: events.sport })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(gte(matches.matchDate, thirtyDaysAgo));
        const matchCount = matchRecords.length;

        const eventRecords = await db.select({ endDate: events.endDate, sport: events.sport })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, thirtyDaysAgo)));
        const eventHostedCount = eventRecords.length;

        // Build 4 week breakdown statically
        const weeklyBreakdownArray = [
            { week: 'Week 1', registrations: 0, matches: 0, earnings: 0 },
            { week: 'Week 2', registrations: 0, matches: 0, earnings: 0 },
            { week: 'Week 3', registrations: 0, matches: 0, earnings: 0 },
            { week: 'Week 4', registrations: 0, matches: 0, earnings: 0 }
        ];

        // Map DB records to weeks (0-7 days = week 4, 8-14 = week 3, etc. relative to today)
        const nowMs = Date.now();
        const getWeekIndex = (dateStamp: Date) => {
            const diffDays = Math.floor((nowMs - new Date(dateStamp).getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) return 3;
            if (diffDays <= 14) return 2;
            if (diffDays <= 21) return 1;
            return 0;
        };

        regRecords.forEach(r => { weeklyBreakdownArray[getWeekIndex(r.registeredAt)].registrations += 1; });
        matchRecords.forEach(m => { weeklyBreakdownArray[getWeekIndex(m.matchDate)].matches += 1; });
        bookingRecords.forEach(b => { weeklyBreakdownArray[getWeekIndex(b.createdAt)].earnings += parseFloat(b.totalCost); });

        // Calculate top sports
        const sportCounts: Record<string, number> = {};
        matchRecords.forEach(m => { sportCounts[m.sport] = (sportCounts[m.sport] || 0) + 1; });
        eventRecords.forEach(e => { sportCounts[e.sport] = (sportCounts[e.sport] || 0) + 1; });
        
        const totalSportEntries = Object.values(sportCounts).reduce((a, b) => a + b, 0);
        const topSports = Object.entries(sportCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalSportEntries > 0 ? Math.round((count / totalSportEntries) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate top venues
        const allVenues = await db.select({ id: venues.id, name: venues.name }).from(venues);
        const venueMap = new Map(allVenues.map(v => [v.id, v.name]));
        
        const venueBookingCounts: Record<string, number> = {};
        bookingRecords.forEach(b => {
             const vId = b.venueId as unknown as string; // UUID from json
             venueBookingCounts[vId] = (venueBookingCounts[vId] || 0) + 1; 
        });

        const topVenues = Object.entries(venueBookingCounts)
            .map(([vId, bookings]) => ({
                name: venueMap.get(vId) || 'Unknown Venue',
                bookings
            }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);

        res.json({
            period: 'Last 30 Days',
            registrations: regCount,
            registrationsTrend: '+0%',
            matchesCreated: matchCount,
            matchesTrend: '+0%',
            eventsHosted: eventHostedCount,
            eventsTrend: '+0%',
            totalEarnings: earningsSum,
            earningsTrend: '+0%',
            weeklyBreakdown: weeklyBreakdownArray,
            topSports,
            topVenues
        });
    } catch (error) {
        console.error('❌ Failed to fetch monthly stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/dashboard/yearly - Yearly stats
router.get('/yearly', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const regRecords = await db.select({ registeredAt: eventRegistrations.registeredAt })
            .from(eventRegistrations)
            .where(gte(eventRegistrations.registeredAt, oneYearAgo));
        const regCount = regRecords.length;

        const bookingRecords = await db.select({ totalCost: venueBookings.totalCost, createdAt: venueBookings.createdAt })
            .from(venueBookings)
            .where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, oneYearAgo)));
        const earningsSum = bookingRecords.reduce((sum, b) => sum + parseFloat(b.totalCost), 0);

        const matchRecords = await db.select({ matchDate: matches.matchDate, sport: events.sport })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(gte(matches.matchDate, oneYearAgo));
        const matchCount = matchRecords.length;

        const eventRecords = await db.select({ endDate: events.endDate, sport: events.sport })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, oneYearAgo)));
        const eventHostedCount = eventRecords.length;
        
        // Calculate total users vs active
        const allUsers = await db.select({ id: users.id }).from(users);
        const totalUsersCount = allUsers.length;
        
        // Active users set
        const activeUserIds = new Set<string>();
        const userRegs = await db.select({ userId: eventRegistrations.userId }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, oneYearAgo));
        userRegs.forEach(r => activeUserIds.add(r.userId as unknown as string));
        const userBookings = await db.select({ userId: venueBookings.userId }).from(venueBookings).where(gte(venueBookings.createdAt, oneYearAgo));
        userBookings.forEach(b => activeUserIds.add(b.userId as unknown as string));
        
        const activeUsersCount = activeUserIds.size;
        
        const userGrowth = {
            totalUsers: totalUsersCount,
            activeUsers: activeUsersCount,
            retentionRate: totalUsersCount > 0 ? Math.round((activeUsersCount / totalUsersCount) * 100) : 0
        };

        // Initialize last 12 months array
        const monthlyBreakdownArray: {
            month: string,
            monthIndex: number,
            year: number,
            registrations: number,
            matches: number,
            earnings: number
        }[] = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthlyBreakdownArray.push({
                month: monthNames[d.getMonth()],
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                registrations: 0,
                matches: 0,
                earnings: 0
            });
        }

        // Map data to months
        regRecords.forEach(r => {
            const d = new Date(r.registeredAt);
            const mData = monthlyBreakdownArray.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
            if (mData) mData.registrations += 1;
        });
        
        matchRecords.forEach(m => {
            const d = new Date(m.matchDate);
            const mData = monthlyBreakdownArray.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
            if (mData) mData.matches += 1;
        });
        
        bookingRecords.forEach(b => {
             const d = new Date(b.createdAt);
             const mData = monthlyBreakdownArray.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
             if (mData) mData.earnings += parseFloat(b.totalCost);
        });

        // Top sports
        const sportCounts: Record<string, number> = {};
        matchRecords.forEach(m => { sportCounts[m.sport] = (sportCounts[m.sport] || 0) + 1; });
        eventRecords.forEach(e => { sportCounts[e.sport] = (sportCounts[e.sport] || 0) + 1; });
        
        const totalSportEntries = Object.values(sportCounts).reduce((a, b) => a + b, 0);
        const topSports = Object.entries(sportCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalSportEntries > 0 ? Math.round((count / totalSportEntries) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            period: 'Last 12 Months',
            registrations: regCount,
            registrationsTrend: '+0%',
            matchesCreated: matchCount,
            matchesTrend: '+0%',
            eventsHosted: eventHostedCount,
            eventsTrend: '+0%',
            totalEarnings: earningsSum,
            earningsTrend: '+0%',
            userGrowth,
            monthlyBreakdown: monthlyBreakdownArray.map(({ month, registrations, matches, earnings }) => ({ month, registrations, matches, earnings })),
            topSports
        });
    } catch (error) {
        console.error('❌ Failed to fetch yearly stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
