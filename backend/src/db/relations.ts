import { relations } from 'drizzle-orm';
import {
    users,
    venues,
    events,
    teams,
    eventRegistrations,
    venueBookings,
    matches,
} from './schema';

// ─── User Relations ──────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
    teams: many(teams),
    eventRegistrations: many(eventRegistrations),
    venueBookings: many(venueBookings),
}));

// ─── Venue Relations ─────────────────────────────────────────────────────────

export const venuesRelations = relations(venues, ({ many }) => ({
    events: many(events),
    venueBookings: many(venueBookings),
}));

// ─── Event Relations ─────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ one, many }) => ({
    venue: one(venues, {
        fields: [events.venueId],
        references: [venues.id],
    }),
    registrations: many(eventRegistrations),
    matches: many(matches),
}));

// ─── Team Relations ──────────────────────────────────────────────────────────

export const teamsRelations = relations(teams, ({ one, many }) => ({
    captain: one(users, {
        fields: [teams.captainId],
        references: [users.id],
    }),
    matchesAsTeam1: many(matches, { relationName: 'team1' }),
    matchesAsTeam2: many(matches, { relationName: 'team2' }),
}));

// ─── Event Registration Relations ────────────────────────────────────────────

export const eventRegistrationsRelations = relations(
    eventRegistrations,
    ({ one }) => ({
        user: one(users, {
            fields: [eventRegistrations.userId],
            references: [users.id],
        }),
        event: one(events, {
            fields: [eventRegistrations.eventId],
            references: [events.id],
        }),
    })
);

// ─── Venue Booking Relations ─────────────────────────────────────────────────

export const venueBookingsRelations = relations(
    venueBookings,
    ({ one }) => ({
        user: one(users, {
            fields: [venueBookings.userId],
            references: [users.id],
        }),
        venue: one(venues, {
            fields: [venueBookings.venueId],
            references: [venues.id],
        }),
    })
);

// ─── Match Relations ─────────────────────────────────────────────────────────

export const matchesRelations = relations(matches, ({ one }) => ({
    event: one(events, {
        fields: [matches.eventId],
        references: [events.id],
    }),
    team1: one(teams, {
        fields: [matches.team1Id],
        references: [teams.id],
        relationName: 'team1',
    }),
    team2: one(teams, {
        fields: [matches.team2Id],
        references: [teams.id],
        relationName: 'team2',
    }),
    winner: one(teams, {
        fields: [matches.winnerId],
        references: [teams.id],
        relationName: 'winner',
    }),
}));
