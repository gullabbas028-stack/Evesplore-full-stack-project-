import { db, pool } from "@/db";
import { seatLocks, bookedSeats } from "@/db/schema";
import { and, eq, gt, inArray } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const LOCK_MINUTES = 5;

// Toggle-lock a set of seats for the current user/session.
// Body: { eventId, sessionId, seats: string[] }  (full desired set)
export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const user = await requireUser();
    const { eventId, sessionId, seats } = await req.json();
    if (!eventId || !sessionId || !Array.isArray(seats)) return fail("Invalid request", 422);
    if (seats.length > 10) return fail("You can select up to 10 seats", 422);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);

    await client.query("BEGIN");

    // Ensure none are already booked
    if (seats.length) {
      const bookedRows = await db
        .select({ seatLabel: bookedSeats.seatLabel })
        .from(bookedSeats)
        .where(and(eq(bookedSeats.eventId, Number(eventId)), inArray(bookedSeats.seatLabel, seats)));
      if (bookedRows.length) {
        await client.query("ROLLBACK");
        return fail(`Seat ${bookedRows[0].seatLabel} is already booked`, 409);
      }

      // Ensure none locked by others
      const otherLocks = await db
        .select()
        .from(seatLocks)
        .where(and(eq(seatLocks.eventId, Number(eventId)), inArray(seatLocks.seatLabel, seats), gt(seatLocks.expiresAt, now)));
      const conflict = otherLocks.find((l) => l.userId !== user.id || l.sessionId !== sessionId);
      if (conflict) {
        await client.query("ROLLBACK");
        return fail(`Seat ${conflict.seatLabel} was just taken by someone else`, 409);
      }
    }

    // Remove existing locks for this session on this event, then re-insert the desired set
    await db
      .delete(seatLocks)
      .where(and(eq(seatLocks.eventId, Number(eventId)), eq(seatLocks.sessionId, sessionId)));

    if (seats.length) {
      await db.insert(seatLocks).values(
        seats.map((label: string) => ({
          eventId: Number(eventId),
          seatLabel: label,
          userId: user.id,
          sessionId,
          expiresAt,
        }))
      );
    }

    await client.query("COMMIT");
    return ok({ locked: seats, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    return handleError(e);
  } finally {
    client.release();
  }
}

// Release all locks for a session/event
export async function DELETE(req: Request) {
  try {
    await requireUser();
    const { eventId, sessionId } = await req.json();
    await db
      .delete(seatLocks)
      .where(and(eq(seatLocks.eventId, Number(eventId)), eq(seatLocks.sessionId, sessionId)));
    return ok({ released: true });
  } catch (e) {
    return handleError(e);
  }
}
