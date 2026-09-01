import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  numeric,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ---------------------- USERS ----------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  password: text("password").notNull(),
  phone: varchar("phone", { length: 40 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 20 }).notNull().default("USER"), // USER | ADMIN | STAFF
  dateOfBirth: varchar("date_of_birth", { length: 40 }),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------- CATEGORIES ----------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  icon: varchar("icon", { length: 40 }).default("music"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------- VENUES ----------------------
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 120 }).notNull(),
  image: text("image"),
  capacity: integer("capacity").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("4.5"),
  // seatLayout: { rows: number, seatsPerRow: number, categories: [{name, rows:[], price}] }
  seatLayout: jsonb("seat_layout"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------- EVENTS ----------------------
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 240 }).notNull(),
    slug: varchar("slug", { length: 260 }).notNull().unique(),
    description: text("description"),
    category: varchar("category", { length: 120 }).notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    banner: text("banner"),
    images: jsonb("images").$type<string[]>().default([]),
    date: varchar("date", { length: 40 }).notNull(), // YYYY-MM-DD
    startTime: varchar("start_time", { length: 20 }).notNull(),
    endTime: varchar("end_time", { length: 20 }).notNull(),
    venueId: integer("venue_id").references(() => venues.id),
    organizer: varchar("organizer", { length: 200 }),
    rules: text("rules"),
    ageRestriction: varchar("age_restriction", { length: 60 }).default("All Ages"),
    // ticketTypes: [{ name, price, color }]
    ticketTypes: jsonb("ticket_types"),
    totalCapacity: integer("total_capacity").notNull().default(0),
    availableCapacity: integer("available_capacity").notNull().default(0),
    startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).default("0"),
    status: varchar("status", { length: 20 }).notNull().default("PUBLISHED"), // DRAFT | PUBLISHED
    featured: boolean("featured").default(false),
    popular: boolean("popular").default(false),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    catIdx: index("events_category_idx").on(t.category),
    cityIdx: index("events_venue_idx").on(t.venueId),
  })
);

// ---------------------- SEAT LOCKS ----------------------
// Ephemeral seat holds while a user is in checkout
export const seatLocks = pgTable(
  "seat_locks",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull(),
    seatLabel: varchar("seat_label", { length: 20 }).notNull(), // e.g. D11
    userId: integer("user_id").notNull(),
    sessionId: varchar("session_id", { length: 80 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("seat_locks_event_seat_uniq").on(t.eventId, t.seatLabel),
    evIdx: index("seat_locks_event_idx").on(t.eventId),
  })
);

// ---------------------- BOOKINGS ----------------------
export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    bookingCode: varchar("booking_code", { length: 40 }).notNull().unique(),
    userId: integer("user_id").notNull(),
    eventId: integer("event_id").notNull(),
    venueId: integer("venue_id"),
    // seats: [{ label, category, price }]
    seats: jsonb("seats").$type<{ label: string; category: string; price: number }[]>().notNull(),
    ticketType: varchar("ticket_type", { length: 60 }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    bookingFee: numeric("booking_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    serviceFee: numeric("service_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    couponCode: varchar("coupon_code", { length: 60 }),
    paymentIntentId: varchar("payment_intent_id", { length: 120 }),
    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("PAID"), // PENDING | PAID | FAILED | REFUNDED
    bookingStatus: varchar("booking_status", { length: 20 }).notNull().default("CONFIRMED"), // CONFIRMED | CANCELLED | USED | COMPLETED
    qrToken: varchar("qr_token", { length: 120 }).notNull(),
    ticketStatus: varchar("ticket_status", { length: 20 }).notNull().default("VALID"), // VALID | USED | CANCELLED
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("bookings_user_idx").on(t.userId),
    eventIdx: index("bookings_event_idx").on(t.eventId),
  })
);

// Permanently booked seats per event (source of truth for BOOKED state)
export const bookedSeats = pgTable(
  "booked_seats",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull(),
    seatLabel: varchar("seat_label", { length: 20 }).notNull(),
    bookingId: integer("booking_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("booked_seats_event_seat_uniq").on(t.eventId, t.seatLabel),
    evIdx: index("booked_seats_event_idx").on(t.eventId),
  })
);

// ---------------------- FAVORITES ----------------------
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    eventId: integer("event_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("favorites_user_event_uniq").on(t.userId, t.eventId),
  })
);

// ---------------------- COUPONS ----------------------
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  percentOff: integer("percent_off").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Category = typeof categories.$inferSelect;
