import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { db } from '../db';
import { users, events, eventRegistrations, venues, venueBookings, teams, matches, shopOrders } from '../db/schema';
import { sql, eq, gte, lte, and, sum, count } from 'drizzle-orm';

const router = Router();

// Removed /stats endpoint - merged into unified /

// GET /api/admin/dashboard - Unified Stats
router.get('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const { range, date, startDate: queryStartDate, endDate: queryEndDate } = req.query;
        let startDate = new Date();
        let endDate = new Date(); // now

        if (queryStartDate && queryEndDate) {
            startDate = new Date(queryStartDate as string);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(queryEndDate as string);
            endDate.setHours(23, 59, 59, 999);
        } else if (date) {
            startDate = new Date(date as string);
            startDate.setHours(0, 0, 0, 0);
            endDate.setTime(startDate.getTime());
            endDate.setHours(23, 59, 59, 999);
        } else {
            if (range === 'year') {
                startDate.setFullYear(startDate.getFullYear() - 1);
            } else if (range === 'week' || range === '7days') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (range === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (range === 'all') {
                startDate = new Date(0); // Epoch
            } else {
                startDate.setDate(startDate.getDate() - 30);
            }
        }

        const [regResult] = await db.select({ value: count(eventRegistrations.id) }).from(eventRegistrations).where(and(gte(eventRegistrations.registeredAt, startDate), lte(eventRegistrations.registeredAt, endDate)));
        const [matchResult] = await db.select({ value: count(matches.id) }).from(matches).where(and(gte(matches.matchDate, startDate), lte(matches.matchDate, endDate)));
        const [eventResult] = await db.select({ value: count(events.id) }).from(events).where(and(gte(events.startDate, startDate), lte(events.startDate, endDate))); // Count all events in range
        const [hostedEventResult] = await db.select({ value: count(events.id) }).from(events).where(and(eq(events.status, 'COMPLETED'), gte(events.startDate, startDate), lte(events.startDate, endDate)));
        const [earningResult] = await db.select({ value: sum(venueBookings.totalCost) }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, startDate), lte(venueBookings.createdAt, endDate)));
        
        // Additional high level stats for Date Range
        const [userCount] = await db.select({ value: count(users.id) }).from(users).where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate)));
        const [activeEventCount] = await db.select({ value: count(events.id) }).from(events).where(and(eq(events.status, 'UPCOMING'), gte(events.createdAt, startDate), lte(events.createdAt, endDate)));
        const [teamCount] = await db.select({ value: count(teams.id) }).from(teams).where(and(gte(teams.createdAt, startDate), lte(teams.createdAt, endDate)));
        const shopOrderStats = await db.select({
            status: shopOrders.status,
            count: count(shopOrders.id)
        }).from(shopOrders)
        .where(and(gte(shopOrders.createdAt, startDate), lte(shopOrders.createdAt, endDate)))
        .groupBy(shopOrders.status);

        let totalOrders = 0;
        let pendingCount = 0;
        let approvedCount = 0;
        let fulfilledCount = 0;
        let refundedCount = 0;

        shopOrderStats.forEach(stat => {
            const num = Number(stat.count);
            totalOrders += num;
            if (stat.status === 'PENDING') pendingCount += num;
            if (stat.status === 'PAID') approvedCount += num;
            if (stat.status === 'SHIPPED' || stat.status === 'DELIVERED') fulfilledCount += num;
            if (stat.status === 'CANCELLED') refundedCount += num;
        });

        let chartDataMap = new Map();
        
        if (range === 'year' && !date) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(endDate);
                d.setMonth(d.getMonth() - i);
                const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                chartDataMap.set(key, { label, fullDate: key, registrations: 0, matches: 0, earnings: 0 });
            }
        } else if (range === 'week' && !date) {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(endDate);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                const label = d.toLocaleDateString('en-US', { weekday: 'short' });
                chartDataMap.set(key, { label, fullDate: key, registrations: 0, matches: 0, earnings: 0 });
            }
        } else if (!date) {
             for (let i = 29; i >= 0; i--) {
                 const d = new Date(endDate);
                 d.setDate(d.getDate() - i);
                 const key = d.toISOString().split('T')[0];
                 const label = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
                 chartDataMap.set(key, { label, fullDate: key, registrations: 0, matches: 0, earnings: 0 });
             }
        }

        const groupingFormat = (range === 'year' && !date) ? 'YYYY-MM' : 'YYYY-MM-DD';
        
        let chartData: any[] = [];
        if (!date) {
            const regGroups = await db.select({
                key: sql<string>`to_char(${eventRegistrations.registeredAt}, '${sql.raw(groupingFormat)}')`,
                count: count(eventRegistrations.id)
            }).from(eventRegistrations).where(and(gte(eventRegistrations.registeredAt, startDate), lte(eventRegistrations.registeredAt, endDate))).groupBy(sql`to_char(${eventRegistrations.registeredAt}, '${sql.raw(groupingFormat)}')`);
            
            const matchGroups = await db.select({
                key: sql<string>`to_char(${matches.matchDate}, '${sql.raw(groupingFormat)}')`,
                count: count(matches.id)
            }).from(matches).where(and(gte(matches.matchDate, startDate), lte(matches.matchDate, endDate))).groupBy(sql`to_char(${matches.matchDate}, '${sql.raw(groupingFormat)}')`);
            
            const bookingGroups = await db.select({
                key: sql<string>`to_char(${venueBookings.createdAt}, '${sql.raw(groupingFormat)}')`,
                cost: sum(venueBookings.totalCost)
            }).from(venueBookings).where(and(eq(venueBookings.status, 'CONFIRMED'), gte(venueBookings.createdAt, startDate), lte(venueBookings.createdAt, endDate))).groupBy(sql`to_char(${venueBookings.createdAt}, '${sql.raw(groupingFormat)}')`);
            
            regGroups.forEach(g => { if (chartDataMap.has(g.key)) chartDataMap.get(g.key).registrations = Number(g.count); });
            matchGroups.forEach(g => { if (chartDataMap.has(g.key)) chartDataMap.get(g.key).matches = Number(g.count); });
            bookingGroups.forEach((g: any) => { if (chartDataMap.has(g.key)) chartDataMap.get(g.key).earnings = parseFloat(g.cost || '0'); });
            
            chartData = Array.from(chartDataMap.values());
        }

        const matchSports = await db.select({ sport: events.sport, count: count(matches.id) })
            .from(matches)
            .innerJoin(events, eq(matches.eventId, events.id))
            .where(and(gte(matches.matchDate, startDate), lte(matches.matchDate, endDate)))
            .groupBy(events.sport);

        const eventSports = await db.select({ sport: events.sport, count: count(events.id) })
            .from(events)
            .where(and(eq(events.status, 'COMPLETED'), gte(events.startDate, startDate), lte(events.startDate, endDate)))
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
            period: date ? `Date: ${date}` : `Last 1 ${range || 'month'}`,
            registrations: regResult?.value || 0,
            matchesCreated: matchResult?.value || 0,
            eventsHosted: hostedEventResult?.value || 0,
            totalUsers: userCount?.value || 0,
            activeEvents: activeEventCount?.value || 0,
            totalTeams: teamCount?.value || 0,
            totalEarnings: parseFloat((earningResult?.value as any) || '0'),
            totalOrders,
            pendingCount,
            approvedCount,
            fulfilledCount,
            partialCount: 0,
            refundedCount,
            totalRevenue: parseFloat((earningResult?.value as any) || '0'), // mapped to existing earning logic 
            chartData,
            topSports
        });
    } catch (error) {
        console.error('❌ Failed to fetch dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/dashboard/date-details - Raw Drilldown
router.get('/dashboard/date-details', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const { date, range } = req.query;
        if (!date) return res.status(400).json({ error: 'Date is required' });
        
        let startDate = new Date();
        let endDate = new Date();
        
        if (range === 'year' && (date as string).length === 7) {
             const [y, m] = (date as string).split('-');
             startDate = new Date(Number(y), Number(m)-1, 1);
             startDate.setHours(0,0,0,0);
             endDate = new Date(Number(y), Number(m), 0);
             endDate.setHours(23,59,59,999);
        } else {
             startDate = new Date(date as string);
             startDate.setHours(0,0,0,0);
             endDate = new Date(date as string);
             endDate.setHours(23,59,59,999);
        }

        const regs = await db.select({
            id: eventRegistrations.id,
            user: users.name,
            registeredAt: eventRegistrations.registeredAt
        }).from(eventRegistrations)
          .innerJoin(users, eq(eventRegistrations.userId, users.id))
          .where(and(gte(eventRegistrations.registeredAt, startDate), lte(eventRegistrations.registeredAt, endDate)));

        const ms = await db.select({
            id: matches.id,
            date: matches.matchDate,
            score: matches.score,
            status: matches.status,
            event: events.title
        }).from(matches)
          .innerJoin(events, eq(matches.eventId, events.id))
          .where(and(gte(matches.matchDate, startDate), lte(matches.matchDate, endDate)));

        res.json({
             registrations: regs,
             matches: ms
        });
    } catch (error) {
        console.error('❌ Failed to fetch date details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
