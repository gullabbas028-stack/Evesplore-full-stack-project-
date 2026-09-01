import { db } from "@/db";
import { events, venues, bookedSeats, seatLocks } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { buildSeats, DEFAULT_LAYOUT, DEFAULT_TICKET_TYPES, SeatLayout, TicketType } from "@/lib/seats";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    if (!eventId) return fail("Invalid event", 400);
    const sessionId = new URL(req.url).searchParams.get("sessionId") || "";
    const me = await getCurrentUser();

    const [row] = await db
      .select({ event: events, venue: venues })
      .from(events)
      .leftJoin(venues, eq(events.venueId, venues.id))
      .where(eq(events.id, eventId))
      .limit(1);
    if (!row) return fail("Event not found", 404);

    const ticketTypes: TicketType[] =
      (row.event.ticketTypes as TicketType[]) || DEFAULT_TICKET_TYPES;
    const layout: SeatLayout = (row.venue?.seatLayout as SeatLayout) || DEFAULT_LAYOUT;
    const allSeats = buildSeats(layout, ticketTypes);

    // clean expired locks (best effort)
    const now = new Date();
    const booked = await db
      .select({ seatLabel: bookedSeats.seatLabel })
      .from(bookedSeats)
      .where(eq(bookedSeats.eventId, eventId));
    const bookedSet = new Set(booked.map((b) => b.seatLabel));

    const locks = await db
      .select()
      .from(seatLocks)
      .where(and(eq(seatLocks.eventId, eventId), gt(seatLocks.expiresAt, now)));

    const lockMap = new Map<string, { mine: boolean; expiresAt: Date }>();
    for (const l of locks) {
      lockMap.set(l.seatLabel, {
        mine: !!me && l.userId === me.id && l.sessionId === sessionId,
        expiresAt: l.expiresAt,
      });
    }

    const seats = allSeats.map((s) => {
      let status: "AVAILABLE" | "BOOKED" | "LOCKED" | "MINE" = "AVAILABLE";
      let lockExpires: string | null = null;
      if (bookedSet.has(s.label)) status = "BOOKED";
      else if (lockMap.has(s.label)) {
        const lk = lockMap.get(s.label)!;
        status = lk.mine ? "MINE" : "LOCKED";
        lockExpires = lk.expiresAt.toISOString();
      }
      return { ...s, status, lockExpires };
    });

    return ok({
      eventId,
      layout,
      ticketTypes,
      seats,
      event: {
        id: row.event.id,
        title: row.event.title,
        date: row.event.date,
        startTime: row.event.startTime,
        endTime: row.event.endTime,
        banner: row.event.banner,
        category: row.event.category,
        tags: row.event.tags,
        venueName: row.venue?.name,
        venueCity: row.venue?.city,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
