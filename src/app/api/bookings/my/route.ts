import { db } from "@/db";
import { bookings, events, venues } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({ booking: bookings, event: events, venue: venues })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(venues, eq(events.venueId, venues.id))
      .where(eq(bookings.userId, user.id))
      .orderBy(desc(bookings.createdAt));

    const data = rows.map((r) => ({
      ...r.booking,
      event: r.event
        ? {
            id: r.event.id,
            title: r.event.title,
            date: r.event.date,
            startTime: r.event.startTime,
            banner: r.event.banner,
            category: r.event.category,
            venueName: r.venue?.name,
            venueCity: r.venue?.city,
          }
        : null,
    }));
    return ok({ bookings: data });
  } catch (e) {
    return handleError(e);
  }
}
