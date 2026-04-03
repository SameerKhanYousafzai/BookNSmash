import {
    pgTable,
    pgEnum,
    uuid,
    text,
    timestamp,
    integer,
    decimal,
    jsonb,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);

export const eventStatusEnum = pgEnum('event_status', [
    'UPCOMING',
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
]);

export const bookingStatusEnum = pgEnum('booking_status', [
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
]);

export const registrationStatusEnum = pgEnum('registration_status', [
    'REGISTERED',
    'CANCELLED',
    'ATTENDED',
]);

export const matchStatusEnum = pgEnum('match_status', [
    'SCHEDULED',
    'LIVE',
    'COMPLETED',
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable(
    'users',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        name: text('name').notNull(),
        email: text('email').notNull(),
        passwordHash: text('password_hash').notNull(),
        role: userRoleEnum('role').default('USER').notNull(),
        resetToken: text('reset_token'),
        resetTokenExpiry: timestamp('reset_token_expiry', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex('users_email_idx').on(table.email),
    ]
);

// ─── Venues ──────────────────────────────────────────────────────────────────

export const venues = pgTable('venues', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    sports: text('sports').array().notNull().default([]),
    amenities: text('amenities').array().notNull().default([]),
    pricePerHour: decimal('price_per_hour', { precision: 10, scale: 2 }).notNull(),
    operatingHours: jsonb('operating_hours').$type<Record<string, string>>().default({}),
    images: text('images').array().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// ─── Events ──────────────────────────────────────────────────────────────────

export const events = pgTable(
    'events',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        title: text('title').notNull(),
        description: text('description'),
        sport: text('sport').notNull(),
        startDate: timestamp('start_date', { withTimezone: true }).notNull(),
        endDate: timestamp('end_date', { withTimezone: true }).notNull(),
        venueId: uuid('venue_id')
            .references(() => venues.id, { onDelete: 'restrict' })
            .notNull(),
        maxParticipants: integer('max_participants').notNull(),
        entryFee: decimal('entry_fee', { precision: 10, scale: 2 })
            .default('0')
            .notNull(),
        status: eventStatusEnum('status').default('UPCOMING').notNull(),
        imageUrl: text('image_url'),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('events_start_date_idx').on(table.startDate),
        index('events_venue_id_idx').on(table.venueId),
    ]
);

// ─── Teams ───────────────────────────────────────────────────────────────────

export const teams = pgTable(
    'teams',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        name: text('name').notNull(),
        sport: text('sport').notNull(),
        captainId: uuid('captain_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        wins: integer('wins').default(0).notNull(),
        losses: integer('losses').default(0).notNull(),
        description: text('description'),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('teams_captain_id_idx').on(table.captainId),
        uniqueIndex('teams_captain_sport_idx').on(table.captainId, table.sport),
    ]
);

export const teamMembers = pgTable(
    'team_members',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
        userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
        joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('team_member_unique_idx').on(table.teamId, table.userId),
        index('team_member_user_idx').on(table.userId),
    ]
);

// ─── Event Registrations ─────────────────────────────────────────────────────

export const eventRegistrations = pgTable(
    'event_registrations',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        eventId: uuid('event_id')
            .references(() => events.id, { onDelete: 'cascade' })
            .notNull(),
        status: registrationStatusEnum('status').default('REGISTERED').notNull(),
        registeredAt: timestamp('registered_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex('event_reg_user_event_idx').on(table.userId, table.eventId),
        index('event_reg_user_id_idx').on(table.userId),
    ]
);

// ─── Venue Bookings ──────────────────────────────────────────────────────────

export const venueBookings = pgTable(
    'venue_bookings',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        venueId: uuid('venue_id')
            .references(() => venues.id, { onDelete: 'restrict' })
            .notNull(),
        startTime: timestamp('start_time', { withTimezone: true }).notNull(),
        endTime: timestamp('end_time', { withTimezone: true }).notNull(),
        totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
        status: bookingStatusEnum('status').default('PENDING').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('venue_bookings_time_idx').on(table.startTime, table.endTime),
    ]
);

// ─── Matches ─────────────────────────────────────────────────────────────────

export const matches = pgTable('matches', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
        .references(() => events.id, { onDelete: 'cascade' })
        .notNull(),
    team1Id: uuid('team1_id')
        .references(() => teams.id, { onDelete: 'restrict' })
        .notNull(),
    team2Id: uuid('team2_id')
        .references(() => teams.id, { onDelete: 'restrict' })
        .notNull(),
    winnerId: uuid('winner_id').references(() => teams.id, {
        onDelete: 'set null',
    }),
    score: text('score'),
    matchDate: timestamp('match_date', { withTimezone: true }).notNull(),
    status: matchStatusEnum('status').default('SCHEDULED').notNull(),
});

// ─── Products (Shop) ─────────────────────────────────────────────────────────

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').notNull(), // Equipment, Apparel, Accessories
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    stock: integer('stock').default(0).notNull(),
    image: text('image'),
    images: text('images').array().notNull().default([]),
    rating: decimal('rating', { precision: 3, scale: 1 }).default('0.0'),
    reviews: integer('reviews').default(0),
    vendor: text('vendor'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// ─── Shop Orders ─────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
    'PENDING',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
]);

export const shopOrders = pgTable('shop_orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const shopOrderItems = pgTable('shop_order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => shopOrders.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
    quantity: integer('quantity').notNull(),
    priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
});
