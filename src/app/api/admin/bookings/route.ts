import { db } from "@/db";
import { bookings, events, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db
      .select({ booking: bookings, event: events, buyer: users })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt));
    return ok({
      bookings: rows.map((r) => ({
        id: r.booking.id,
        bookingCode: r.booking.bookingCode,
        customer: r.buyer?.name,
        customerEmail: r.buyer?.email,
        event: r.event?.title,
        seats: r.booking.seats,
        amount: r.booking.totalAmount,
        paymentStatus: r.booking.paymentStatus,
        bookingStatus: r.booking.bookingStatus,
        ticketStatus: r.booking.ticketStatus,
        createdAt: r.booking.createdAt,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
