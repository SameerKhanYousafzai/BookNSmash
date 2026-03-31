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

        // Raw aggregates
        const [regResult] = await db.select({ value: count(eventRegistrations.id) }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, sevenDaysAgo));
        const [matchResult] = await db.select({ value: count(matches.id) }).from(matches).where(gte(matches.matchDate, sevenDaysAgo));
        const [eventResult] = await db.select({ value: count(events.id) }).from(events).where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, sevenDaysAgo)));
        const [earningResult] = await db.select({ value: sum(venueBookings.totalCost) }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, sevenDaysAgo)));
        
        const regCount = regResult?.value || 0;
        const matchCount = matchResult?.value || 0;
        const eventHostedCount = eventResult?.value || 0;
        const earningsSum = parseFloat(earningResult?.value || '0');

        // Build daily breakdown structure
        const dailyMap = new Map();
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            dailyMap.set(dayName, { day: dayName, registrations: 0, matches: 0, earnings: 0 });
        }

        // DB Driven Group By Queries
        const regGroups = await db.select({
            dayName: sql<string>`to_char(${eventRegistrations.registeredAt}, 'Dy')`,
            count: count(eventRegistrations.id)
        }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, sevenDaysAgo)).groupBy(sql`to_char(${eventRegistrations.registeredAt}, 'Dy')`);
        
        const matchGroups = await db.select({
            dayName: sql<string>`to_char(${matches.matchDate}, 'Dy')`,
            count: count(matches.id)
        }).from(matches).where(gte(matches.matchDate, sevenDaysAgo)).groupBy(sql`to_char(${matches.matchDate}, 'Dy')`);

        const earningGroups = await db.select({
            dayName: sql<string>`to_char(${venueBookings.createdAt}, 'Dy')`,
            total: sum(venueBookings.totalCost)
        }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, sevenDaysAgo))).groupBy(sql`to_char(${venueBookings.createdAt}, 'Dy')`);

        regGroups.forEach(g => { if (dailyMap.has(g.dayName)) dailyMap.get(g.dayName).registrations = g.count; });
        matchGroups.forEach(g => { if (dailyMap.has(g.dayName)) dailyMap.get(g.dayName).matches = g.count; });
        earningGroups.forEach(g => { if (dailyMap.has(g.dayName)) dailyMap.get(g.dayName).earnings = parseFloat(g.total || '0'); });

        const dailyBreakdown = Array.from(dailyMap.values()).reverse();

        // Top Sports via SQL Group By
        const matchSports = await db.select({ sport: events.sport, count: count(matches.id) })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(gte(matches.matchDate, sevenDaysAgo))
            .groupBy(events.sport);

        const eventSports = await db.select({ sport: events.sport, count: count(events.id) })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, sevenDaysAgo)))
            .groupBy(events.sport);

        const sportCounts: Record<string, number> = {};
        matchSports.forEach(s => sportCounts[s.sport] = (sportCounts[s.sport] || 0) + Number(s.count));
        eventSports.forEach(s => sportCounts[s.sport] = (sportCounts[s.sport] || 0) + Number(s.count));

        const totalSportEntries = Object.values(sportCounts).reduce((a, b) => a + b, 0);
        const topSports = Object.entries(sportCounts)
            .map(([name, val]) => ({
                name,
                count: val,
                percentage: totalSportEntries > 0 ? Math.round((val / totalSportEntries) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            period: 'Last 7 Days',
            registrations: regCount,
            registrationsTrend: '+0%', 
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

        const [regResult] = await db.select({ value: count(eventRegistrations.id) }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, thirtyDaysAgo));
        const [matchResult] = await db.select({ value: count(matches.id) }).from(matches).where(gte(matches.matchDate, thirtyDaysAgo));
        const [eventResult] = await db.select({ value: count(events.id) }).from(events).where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, thirtyDaysAgo)));
        const [earningResult] = await db.select({ value: sum(venueBookings.totalCost) }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, thirtyDaysAgo)));

        const regCount = regResult?.value || 0;
        const matchCount = matchResult?.value || 0;
        const eventHostedCount = eventResult?.value || 0;
        const earningsSum = parseFloat(earningResult?.value || '0');

        // Instead of pure DB week interval partitioning (complex in postgres), we just pull id + date and group in memory ONLY to determine "Week 1", "Week 2"... 
        // This is safe because pulling just id+date over 30 days is extremely lightweight compared to pulling all columns
        // Actually, we can use DB `ceil((extract(epoch from now()) - extract(epoch from date)) / 86400 / 7)` 
        // But doing it statically is fine for the 4-week structure requested.
        
        const regDates = await db.select({ date: eventRegistrations.registeredAt }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, thirtyDaysAgo));
        const matchDates = await db.select({ date: matches.matchDate }).from(matches).where(gte(matches.matchDate, thirtyDaysAgo));
        const bookingDates = await db.select({ date: venueBookings.createdAt, cost: venueBookings.totalCost }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, thirtyDaysAgo)));

        const weeklyBreakdownArray = [
            { week: 'Week 1', registrations: 0, matches: 0, earnings: 0 },
            { week: 'Week 2', registrations: 0, matches: 0, earnings: 0 },
            { week: 'Week 3', registrations: 0, matches: 0, earnings: 0 },
            { week: 'Week 4', registrations: 0, matches: 0, earnings: 0 }
        ];

        const nowMs = Date.now();
        const getWeekIndex = (dateStamp: Date) => {
            const diffDays = Math.floor((nowMs - new Date(dateStamp).getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) return 3;
            if (diffDays <= 14) return 2;
            if (diffDays <= 21) return 1;
            return 0;
        };

        regDates.forEach(r => { weeklyBreakdownArray[getWeekIndex(r.date)].registrations += 1; });
        matchDates.forEach(m => { weeklyBreakdownArray[getWeekIndex(m.date)].matches += 1; });
        bookingDates.forEach(b => { weeklyBreakdownArray[getWeekIndex(b.date)].earnings += parseFloat(b.cost); });

        // Calculate top venues via DB GroupBy
        const venueGroups = await db.select({
            venueId: venueBookings.venueId,
            count: count(venueBookings.id)
        }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, thirtyDaysAgo))).groupBy(venueBookings.venueId);

        const allVenues = await db.select({ id: venues.id, name: venues.name }).from(venues);
        const venueMap = new Map(allVenues.map(v => [v.id, v.name]));

        const topVenues = venueGroups.map(v => ({
            name: venueMap.get(v.venueId) || 'Unknown Venue',
            bookings: Number(v.count)
        })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

        // Top Sports via SQL Group By
        const matchSports = await db.select({ sport: events.sport, count: count(matches.id) })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(gte(matches.matchDate, thirtyDaysAgo))
            .groupBy(events.sport);

        const eventSports = await db.select({ sport: events.sport, count: count(events.id) })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, thirtyDaysAgo)))
            .groupBy(events.sport);

        const sportCounts: Record<string, number> = {};
        matchSports.forEach(s => sportCounts[s.sport] = (sportCounts[s.sport] || 0) + Number(s.count));
        eventSports.forEach(s => sportCounts[s.sport] = (sportCounts[s.sport] || 0) + Number(s.count));

        const totalSportEntries = Object.values(sportCounts).reduce((a, b) => a + b, 0);
        const topSports = Object.entries(sportCounts)
            .map(([name, val]) => ({
                name,
                count: val,
                percentage: totalSportEntries > 0 ? Math.round((val / totalSportEntries) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
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

        const [regResult] = await db.select({ value: count(eventRegistrations.id) }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, oneYearAgo));
        const [matchResult] = await db.select({ value: count(matches.id) }).from(matches).where(gte(matches.matchDate, oneYearAgo));
        const [eventResult] = await db.select({ value: count(events.id) }).from(events).where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, oneYearAgo)));
        const [earningResult] = await db.select({ value: sum(venueBookings.totalCost) }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, oneYearAgo)));

        const regCount = regResult?.value || 0;
        const matchCount = matchResult?.value || 0;
        const eventHostedCount = eventResult?.value || 0;
        const earningsSum = parseFloat(earningResult?.value || '0');

        const [totalUserResult] = await db.select({ value: count(users.id) }).from(users);
        const totalUsersCount = totalUserResult?.value || 0;
        
        const activeUserIds = new Set<string>();
        const userRegs = await db.select({ userId: eventRegistrations.userId }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, oneYearAgo)).groupBy(eventRegistrations.userId);
        userRegs.forEach(r => activeUserIds.add(r.userId));
        const userBookings = await db.select({ userId: venueBookings.userId }).from(venueBookings).where(gte(venueBookings.createdAt, oneYearAgo)).groupBy(venueBookings.userId);
        userBookings.forEach(b => activeUserIds.add(b.userId));
        
        const activeUsersCount = activeUserIds.size;
        
        const userGrowth = {
            totalUsers: totalUsersCount,
            activeUsers: activeUsersCount,
            retentionRate: totalUsersCount > 0 ? Math.round((activeUsersCount / totalUsersCount) * 100) : 0
        };

        const monthlyBreakdownArray: {
            month: string;
            monthIndex: number;
            year: number;
            registrations: number;
            matches: number;
            earnings: number;
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

        const regGroups = await db.select({
            mIndex: sql<number>`extract(month from ${eventRegistrations.registeredAt}) - 1`,
            year: sql<number>`extract(year from ${eventRegistrations.registeredAt})`,
            count: count(eventRegistrations.id)
        }).from(eventRegistrations).where(gte(eventRegistrations.registeredAt, oneYearAgo)).groupBy(sql`extract(month from ${eventRegistrations.registeredAt})`, sql`extract(year from ${eventRegistrations.registeredAt})`);
        
        const matchGroups = await db.select({
            mIndex: sql<number>`extract(month from ${matches.matchDate}) - 1`,
            year: sql<number>`extract(year from ${matches.matchDate})`,
            count: count(matches.id)
        }).from(matches).where(gte(matches.matchDate, oneYearAgo)).groupBy(sql`extract(month from ${matches.matchDate})`, sql`extract(year from ${matches.matchDate})`);

        const bookingGroups = await db.select({
            mIndex: sql<number>`extract(month from ${venueBookings.createdAt}) - 1`,
            year: sql<number>`extract(year from ${venueBookings.createdAt})`,
            cost: sum(venueBookings.totalCost)
        }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, oneYearAgo))).groupBy(sql`extract(month from ${venueBookings.createdAt})`, sql`extract(year from ${venueBookings.createdAt})`);

        regGroups.forEach(g => {
            const mData = monthlyBreakdownArray.find(m => m.monthIndex === Number(g.mIndex) && m.year === Number(g.year));
            if (mData) mData.registrations = Number(g.count);
        });

        matchGroups.forEach(g => {
            const mData = monthlyBreakdownArray.find(m => m.monthIndex === Number(g.mIndex) && m.year === Number(g.year));
            if (mData) mData.matches = Number(g.count);
        });

        bookingGroups.forEach(g => {
            const mData = monthlyBreakdownArray.find(m => m.monthIndex === Number(g.mIndex) && m.year === Number(g.year));
            if (mData) mData.earnings = parseFloat(g.cost || '0');
        });

        const matchSports = await db.select({ sport: events.sport, count: count(matches.id) })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(gte(matches.matchDate, oneYearAgo))
            .groupBy(events.sport);

        const eventSports = await db.select({ sport: events.sport, count: count(events.id) })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.endDate, oneYearAgo)))
            .groupBy(events.sport);

        const sportCounts: Record<string, number> = {};
        matchSports.forEach(s => sportCounts[s.sport] = (sportCounts[s.sport] || 0) + Number(s.count));
        eventSports.forEach(s => sportCounts[s.sport] = (sportCounts[s.sport] || 0) + Number(s.count));

        const totalSportEntries = Object.values(sportCounts).reduce((a, b) => a + b, 0);
        const topSports = Object.entries(sportCounts)
            .map(([name, val]) => ({
                name,
                count: val,
                percentage: totalSportEntries > 0 ? Math.round((val / totalSportEntries) * 100) : 0
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
