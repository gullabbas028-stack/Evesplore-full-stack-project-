import { db } from "@/db";
import { bookings, events, venues, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const [row] = await db
      .select({ booking: bookings, event: events, venue: venues, buyer: users })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(venues, eq(events.venueId, venues.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, Number(id)))
      .limit(1);
    if (!row) return fail("Booking not found", 404);
    if (row.booking.userId !== user.id && user.role !== "ADMIN" && user.role !== "STAFF")
      return fail("Not authorized", 403);

    return ok({
      ...row.booking,
      customerName: row.buyer?.name,
      customerEmail: row.buyer?.email,
      event: row.event
        ? {
            id: row.event.id,
            title: row.event.title,
            date: row.event.date,
            startTime: row.event.startTime,
            endTime: row.event.endTime,
            banner: row.event.banner,
            category: row.event.category,
            venueName: row.venue?.name,
            venueCity: row.venue?.city,
            venueAddress: row.venue?.address,
          }
        : null,
    });
  } catch (e) {
    return handleError(e);
  }
}
