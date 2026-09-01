import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const [b] = await db.select().from(bookings).where(eq(bookings.id, Number(id))).limit(1);
    if (!b) return fail("Ticket not found", 404);
    if (b.ticketStatus === "USED") return fail("Ticket already used", 409);
    if (b.ticketStatus === "CANCELLED") return fail("Ticket cancelled", 409);
    await db
      .update(bookings)
      .set({ ticketStatus: "USED", bookingStatus: "USED", usedAt: new Date() })
      .where(eq(bookings.id, Number(id)));
    return ok({ used: true });
  } catch (e) {
    return handleError(e);
  }
}
