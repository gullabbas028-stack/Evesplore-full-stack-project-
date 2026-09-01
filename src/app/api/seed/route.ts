import { db } from "@/db";
import { users, venues, events, categories, coupons } from "@/db/schema";
import { sql } from "drizzle-orm";
import { ok, handleError, slugify } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_LAYOUT, DEFAULT_TICKET_TYPES } from "@/lib/seats";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { name: "Music", icon: "music" },
  { name: "Concerts", icon: "mic" },
  { name: "Sports", icon: "trophy" },
  { name: "Theater", icon: "drama" },
  { name: "Comedy", icon: "laugh" },
  { name: "Festivals", icon: "party-popper" },
  { name: "Workshops", icon: "graduation-cap" },
  { name: "Conferences", icon: "presentation" },
  { name: "Family", icon: "users" },
  { name: "Arts", icon: "palette" },
];

const IMG = {
  concert: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  concert2: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
  festival: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  comedy: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80",
  theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
  food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  workshop: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
  rock: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
  arena: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&q=80",
  venue1: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",
  venue2: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80",
  dj: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&q=80",
};

function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST() {
  try {
    // wipe (order matters via cascade-less delete)
    await db.execute(sql`TRUNCATE TABLE booked_seats, seat_locks, favorites, bookings, events, venues, categories, coupons, users RESTART IDENTITY CASCADE`);

    // categories
    await db.insert(categories).values(
      CATEGORIES.map((c) => ({ name: c.name, slug: slugify(c.name), icon: c.icon }))
    );

    // users
    const adminPw = await hashPassword("admin123");
    const userPw = await hashPassword("user123");
    const [admin] = await db
      .insert(users)
      .values({
        name: "Ali Raza",
        email: "admin@evesplore.com",
        password: adminPw,
        role: "ADMIN",
        avatar: "https://i.pravatar.cc/150?img=13",
        phone: "+92 300 1234567",
      })
      .returning();
    await db.insert(users).values([
      { name: "Sara Khan", email: "user@evesplore.com", password: userPw, role: "USER", avatar: "https://i.pravatar.cc/150?img=45" },
      { name: "Bilal Ahmed", email: "staff@evesplore.com", password: userPw, role: "STAFF", avatar: "https://i.pravatar.cc/150?img=33" },
      { name: "Ayesha Malik", email: "ayesha@evesplore.com", password: userPw, role: "USER", avatar: "https://i.pravatar.cc/150?img=20" },
    ]);

    // venues
    const venueRows = await db
      .insert(venues)
      .values([
        { name: "E Block Convention Center", city: "Lahore", address: "E Block, DHA Phase 1, Lahore", description: "A premier convention center hosting concerts and large events with world-class acoustics.", image: IMG.venue1, capacity: 150, rating: "4.8", seatLayout: DEFAULT_LAYOUT },
        { name: "The Grand Arena", city: "Karachi", address: "Clifton Block 4, Karachi", description: "The largest indoor arena in the region with premium seating and stage setups.", image: IMG.arena, capacity: 150, rating: "4.9", seatLayout: DEFAULT_LAYOUT },
        { name: "Skyline Amphitheatre", city: "Islamabad", address: "F-9 Park, Islamabad", description: "An open-air amphitheatre perfect for festivals and live performances.", image: IMG.venue2, capacity: 150, rating: "4.7", seatLayout: DEFAULT_LAYOUT },
        { name: "Downtown Theater Hall", city: "Lahore", address: "MM Alam Road, Gulberg, Lahore", description: "An intimate theater hall ideal for plays, comedy nights, and cultural shows.", image: IMG.theater, capacity: 150, rating: "4.6", seatLayout: DEFAULT_LAYOUT },
        { name: "Riverside Festival Grounds", city: "Karachi", address: "Sea View, DHA, Karachi", description: "Sprawling festival grounds by the water hosting music and food festivals.", image: IMG.festival, capacity: 150, rating: "4.8", seatLayout: DEFAULT_LAYOUT },
      ])
      .returning();

    const tt = DEFAULT_TICKET_TYPES;
    const startPrice = String(Math.min(...tt.map((t) => t.price)));

    const eventSeed = [
      { title: "The Midnight Echo Concert", category: "Music", tags: ["Music", "Live Concert"], banner: IMG.concert, venue: 0, days: 12, organizer: "Echo Productions", desc: "Experience an electrifying night with The Midnight Echo — a fusion of soulful vocals and pulsating beats that will keep you on your feet all night long.", featured: true, popular: true, start: "7:00 PM", end: "11:00 PM" },
      { title: "Global Tech Summit 2026", category: "Conferences", tags: ["Tech", "Conference"], banner: IMG.tech, venue: 1, days: 20, organizer: "TechWorld Inc.", desc: "Join industry leaders, innovators and founders for a two-day deep dive into AI, Web3 and the future of technology.", featured: true, popular: true, start: "9:00 AM", end: "6:00 PM" },
      { title: "Stand-up Comedy Night", category: "Comedy", tags: ["Comedy", "Live"], banner: IMG.comedy, venue: 3, days: 6, organizer: "LOL Nights", desc: "A hilarious evening featuring the region's funniest comedians. Prepare for non-stop laughter!", popular: true, start: "8:00 PM", end: "10:30 PM" },
      { title: "Food & Music Festival", category: "Festivals", tags: ["Festival", "Food"], banner: IMG.food, venue: 4, days: 15, organizer: "Flavour Fest", desc: "A celebration of gourmet food and live music from top artists. Bring your friends and your appetite!", featured: true, start: "12:00 PM", end: "11:00 PM" },
      { title: "Rock Music Live", category: "Concerts", tags: ["Rock", "Concert"], banner: IMG.rock, venue: 1, days: 25, organizer: "Thunder Records", desc: "Feel the power of legendary rock anthems performed live by the best bands in the country.", popular: true, start: "8:00 PM", end: "12:00 AM" },
      { title: "Championship Finals 2026", category: "Sports", tags: ["Sports", "Finals"], banner: IMG.sports, venue: 1, days: 10, organizer: "Pro League", desc: "Witness the ultimate showdown as the top teams battle it out for the championship title.", featured: true, start: "5:00 PM", end: "9:00 PM" },
      { title: "Shakespeare's Hamlet", category: "Theater", tags: ["Theater", "Drama"], banner: IMG.theater, venue: 3, days: 18, organizer: "Royal Theatre Company", desc: "A stunning modern adaptation of Shakespeare's greatest tragedy, performed by an award-winning cast.", start: "7:30 PM", end: "10:00 PM" },
      { title: "Electronic Beats Festival", category: "Festivals", tags: ["EDM", "Festival"], banner: IMG.dj, venue: 2, days: 30, organizer: "Pulse Events", desc: "The biggest EDM festival of the year featuring world-renowned DJs, stunning visuals and an unforgettable atmosphere.", featured: true, popular: true, start: "6:00 PM", end: "2:00 AM" },
      { title: "Digital Marketing Workshop", category: "Workshops", tags: ["Workshop", "Business"], banner: IMG.workshop, venue: 0, days: 8, organizer: "GrowthLab", desc: "A hands-on workshop teaching you cutting-edge digital marketing strategies to grow your brand.", start: "10:00 AM", end: "4:00 PM" },
      { title: "Symphony Under The Stars", category: "Music", tags: ["Classical", "Music"], banner: IMG.concert2, venue: 2, days: 22, organizer: "Philharmonic Society", desc: "An enchanting open-air classical concert performed by a full orchestra beneath the night sky.", featured: true, start: "7:00 PM", end: "9:30 PM" },
      { title: "Family Fun Carnival", category: "Family", tags: ["Family", "Carnival"], banner: IMG.festival, venue: 4, days: 5, organizer: "Happy Days", desc: "A day full of rides, games, and entertainment for the whole family. Fun guaranteed for all ages!", popular: true, start: "11:00 AM", end: "8:00 PM" },
      { title: "Modern Art Exhibition", category: "Arts", tags: ["Art", "Exhibition"], banner: IMG.venue2, venue: 3, days: 14, organizer: "Canvas Gallery", desc: "Explore breathtaking contemporary artworks from emerging and established artists around the world.", start: "10:00 AM", end: "7:00 PM" },
    ];

    for (const e of eventSeed) {
      await db.insert(events).values({
        title: e.title,
        slug: slugify(e.title) + "-" + Math.random().toString(36).slice(2, 6),
        description: e.desc,
        category: e.category,
        tags: e.tags,
        banner: e.banner,
        images: [e.banner],
        date: futureDate(e.days),
        startTime: e.start,
        endTime: e.end,
        venueId: venueRows[e.venue].id,
        organizer: e.organizer,
        rules: "No outside food or drinks. Please arrive 30 minutes early. Valid ID required for entry.",
        ageRestriction: e.category === "Family" ? "All Ages" : "13+",
        ticketTypes: tt,
        totalCapacity: 150,
        availableCapacity: 150,
        startingPrice: startPrice,
        status: "PUBLISHED",
        featured: !!e.featured,
        popular: !!e.popular,
        views: Math.floor(Math.random() * 5000) + 500,
      });
    }

    await db.insert(coupons).values([
      { code: "EVES10", percentOff: 10, active: true },
      { code: "WELCOME20", percentOff: 20, active: true },
      { code: "VIP15", percentOff: 15, active: true },
    ]);

    return ok({ seeded: true, admin: admin.email });
  } catch (e) {
    return handleError(e);
  }
}
