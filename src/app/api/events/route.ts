import { db } from "@/db";
import { events, venues } from "@/db/schema";
import { and, eq, ilike, or, gte, lte, asc, desc, sql, SQL } from "drizzle-orm";
import { ok, handleError, slugify } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_TICKET_TYPES } from "@/lib/seats";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const date = searchParams.get("date");
    const sort = searchParams.get("sort") || "popular";
    const featured = searchParams.get("featured");
    const popular = searchParams.get("popular");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Number(searchParams.get("limit") || 12));
    const offset = (page - 1) * limit;

    const conds: SQL[] = [eq(events.status, "PUBLISHED")];
    if (q) {
      conds.push(
        or(
          ilike(events.title, `%${q}%`),
          ilike(events.category, `%${q}%`),
          ilike(events.organizer, `%${q}%`)
        )!
      );
    }
    if (category && category !== "All") conds.push(eq(events.category, category));
    if (type) conds.push(eq(events.category, type));
    if (date) conds.push(eq(events.date, date));
    if (minPrice) conds.push(gte(events.startingPrice, minPrice));
    if (maxPrice) conds.push(lte(events.startingPrice, maxPrice));
    if (featured === "true") conds.push(eq(events.featured, true));
    if (popular === "true") conds.push(eq(events.popular, true));

    let orderBy;
    switch (sort) {
      case "newest":
        orderBy = desc(events.createdAt);
        break;
      case "price_asc":
        orderBy = asc(events.startingPrice);
        break;
      case "price_desc":
        orderBy = desc(events.startingPrice);
        break;
      default:
        orderBy = desc(events.views);
    }

    const whereClause = and(...conds);

    let rows = await db
      .select({
        event: events,
        venueName: venues.name,
        venueCity: venues.city,
      })
      .from(events)
      .leftJoin(venues, eq(events.venueId, venues.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    if (city && city !== "All") {
      rows = rows.filter((r) => r.venueCity?.toLowerCase() === city.toLowerCase());
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(whereClause);

    const data = rows.map((r) => ({
      ...r.event,
      venueName: r.venueName,
      venueCity: r.venueCity,
    }));

    return ok({ events: data, total: count, page, limit });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    const slug = slugify(b.title) + "-" + Math.random().toString(36).slice(2, 6);
    const ticketTypes = b.ticketTypes || DEFAULT_TICKET_TYPES;
    const prices = ticketTypes.map((t: { price: number }) => Number(t.price));
    const startingPrice = prices.length ? Math.min(...prices) : 0;

    const [ev] = await db
      .insert(events)
      .values({
        title: b.title,
        slug,
        description: b.description || "",
        category: b.category,
        tags: b.tags || [],
        banner: b.banner || null,
        images: b.images || [],
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        venueId: b.venueId ? Number(b.venueId) : null,
        organizer: b.organizer || "EVESPLORE",
        rules: b.rules || "",
        ageRestriction: b.ageRestriction || "All Ages",
        ticketTypes,
        totalCapacity: Number(b.totalCapacity) || 150,
        availableCapacity: Number(b.totalCapacity) || 150,
        startingPrice: String(startingPrice),
        status: b.status || "PUBLISHED",
        featured: !!b.featured,
        popular: !!b.popular,
      })
      .returning();
    return ok(ev, 201);
  } catch (e) {
    return handleError(e);
  }
}
