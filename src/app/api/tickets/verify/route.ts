import { db } from "@/db";
import { bookings, events, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { qrToken, bookingCode } = await req.json();
    if (!qrToken && !bookingCode) return fail("No ticket data provided", 422);

    const [row] = await db
      .select({ booking: bookings, event: events, buyer: users })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(qrToken ? eq(bookings.qrToken, qrToken) : eq(bookings.bookingCode, String(bookingCode).toUpperCase()))
      .limit(1);

    if (!row) return ok({ result: "INVALID", message: "Ticket not found" });

    const b = row.booking;
    if (b.paymentStatus !== "PAID") return ok({ result: "INVALID", message: "Payment not completed" });
    if (b.bookingStatus === "CANCELLED" || b.ticketStatus === "CANCELLED")
      return ok({ result: "CANCELLED", message: "Ticket was cancelled" });
    if (b.ticketStatus === "USED")
      return ok({
        result: "USED",
        message: "Ticket already used",
        usedAt: b.usedAt,
        booking: summarize(row),
      });

    return ok({ result: "VALID", message: "Valid ticket", booking: summarize(row) });
  } catch (e) {
    return handleError(e);
  }
}

function summarize(row: { booking: typeof bookings.$inferSelect; event: typeof events.$inferSelect | null; buyer: typeof users.$inferSelect | null }) {
  return {
    id: row.booking.id,
    bookingCode: row.booking.bookingCode,
    seats: row.booking.seats,
    ticketType: row.booking.ticketType,
    customerName: row.buyer?.name,
    eventTitle: row.event?.title,
    eventDate: row.event?.date,
  };
}
