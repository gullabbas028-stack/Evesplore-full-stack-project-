import { db } from "@/db";
import { bookings, bookedSeats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const bid = Number(id);
    const [b] = await db.select().from(bookings).where(eq(bookings.id, bid)).limit(1);
    if (!b) return fail("Booking not found", 404);
    if (b.userId !== user.id && user.role !== "ADMIN") return fail("Not authorized", 403);
    if (b.bookingStatus === "CANCELLED") return fail("Already cancelled", 409);
    if (b.ticketStatus === "USED") return fail("Ticket already used", 409);

    await db
      .update(bookings)
      .set({ bookingStatus: "CANCELLED", ticketStatus: "CANCELLED", paymentStatus: "REFUNDED" })
      .where(eq(bookings.id, bid));

    // free the seats
    await db.delete(bookedSeats).where(eq(bookedSeats.bookingId, bid));

    return ok({ cancelled: true, refund: Number(b.totalAmount) });
  } catch (e) {
    return handleError(e);
  }
}
