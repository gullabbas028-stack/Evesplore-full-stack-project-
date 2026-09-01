import { db, pool } from "@/db";
import { bookings, bookedSeats, seatLocks, events, coupons } from "@/db/schema";
import { and, eq, inArray, gt, sql } from "drizzle-orm";
import { ok, fail, handleError, genBookingCode, genToken } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const BOOKING_FEE = 500;
const SERVICE_FEE = 350;

// Body: { eventId, sessionId, seats:[{label,category,price}], couponCode?, cardComplete? }
export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const user = await requireUser();
    const body = await req.json();
    const { eventId, sessionId, seats, couponCode } = body;
    if (!eventId || !Array.isArray(seats) || !seats.length) return fail("No seats selected", 422);

    const labels = seats.map((s: { label: string }) => s.label);
    const now = new Date();

    await client.query("BEGIN");

    // Re-validate: not booked
    const alreadyBooked = await db
      .select({ seatLabel: bookedSeats.seatLabel })
      .from(bookedSeats)
      .where(and(eq(bookedSeats.eventId, Number(eventId)), inArray(bookedSeats.seatLabel, labels)));
    if (alreadyBooked.length) {
      await client.query("ROLLBACK");
      return fail(`Seat ${alreadyBooked[0].seatLabel} was already booked. Please choose another.`, 409);
    }

    // Re-validate: locks belong to me (or no active foreign lock)
    const activeLocks = await db
      .select()
      .from(seatLocks)
      .where(and(eq(seatLocks.eventId, Number(eventId)), inArray(seatLocks.seatLabel, labels), gt(seatLocks.expiresAt, now)));
    const foreign = activeLocks.find((l) => l.userId !== user.id || l.sessionId !== sessionId);
    if (foreign) {
      await client.query("ROLLBACK");
      return fail(`Seat ${foreign.seatLabel} is locked by another user`, 409);
    }

    // Pricing
    const subtotal = seats.reduce((sum: number, s: { price: number }) => sum + Number(s.price), 0);
    let discount = 0;
    let appliedCoupon: string | null = null;
    if (couponCode) {
      const [c] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, String(couponCode).toUpperCase()), eq(coupons.active, true)))
        .limit(1);
      if (c) {
        discount = Math.round((subtotal * c.percentOff) / 100);
        appliedCoupon = c.code;
      }
    }
    const total = subtotal + BOOKING_FEE + SERVICE_FEE - discount;

    const bookingCode = genBookingCode();
    const qrToken = genToken(40);
    const categories = Array.from(new Set(seats.map((s: { category: string }) => s.category)));

    // Simulated payment intent (Stripe integration point)
    const paymentIntentId = "pi_" + genToken(24);

    const [booking] = await db
      .insert(bookings)
      .values({
        bookingCode,
        userId: user.id,
        eventId: Number(eventId),
        venueId: null,
        seats,
        ticketType: categories.join(", "),
        amount: String(subtotal),
        bookingFee: String(BOOKING_FEE),
        serviceFee: String(SERVICE_FEE),
        discount: String(discount),
        totalAmount: String(total),
        couponCode: appliedCoupon,
        paymentIntentId,
        paymentStatus: "PAID",
        bookingStatus: "CONFIRMED",
        qrToken,
        ticketStatus: "VALID",
      })
      .returning();

    // Permanently book seats
    await db.insert(bookedSeats).values(
      labels.map((label: string) => ({
        eventId: Number(eventId),
        seatLabel: label,
        bookingId: booking.id,
      }))
    );

    // Remove locks
    await db
      .delete(seatLocks)
      .where(and(eq(seatLocks.eventId, Number(eventId)), eq(seatLocks.sessionId, sessionId)));

    // Decrement capacity
    await db
      .update(events)
      .set({ availableCapacity: sql`GREATEST(${events.availableCapacity} - ${labels.length}, 0)` })
      .where(eq(events.id, Number(eventId)));

    await client.query("COMMIT");
    return ok({ bookingId: booking.id, bookingCode, qrToken }, 201);
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    return handleError(e);
  } finally {
    client.release();
  }
}
