import { db } from "@/db";
import { users, events, bookings } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const [[uc], [ec], [bc]] = await Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(users),
      db.select({ c: sql<number>`count(*)::int` }).from(events),
      db.select({ c: sql<number>`count(*)::int` }).from(bookings),
    ]);

    const [rev] = await db
      .select({ total: sql<number>`coalesce(sum(${bookings.totalAmount}),0)::float` })
      .from(bookings)
      .where(eq(bookings.paymentStatus, "PAID"));

    const [cancelled] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(bookings)
      .where(eq(bookings.bookingStatus, "CANCELLED"));

    const [ticketsSold] = await db
      .select({ c: sql<number>`coalesce(sum(jsonb_array_length(${bookings.seats})),0)::int` })
      .from(bookings)
      .where(eq(bookings.paymentStatus, "PAID"));

    // revenue over last 7 groups (by created date)
    const revByDay = await db
      .select({
        day: sql<string>`to_char(${bookings.createdAt}, 'Mon DD')`,
        revenue: sql<number>`coalesce(sum(${bookings.totalAmount}),0)::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(bookings)
      .groupBy(sql`to_char(${bookings.createdAt}, 'Mon DD'), date_trunc('day', ${bookings.createdAt})`)
      .orderBy(sql`date_trunc('day', ${bookings.createdAt})`)
      .limit(14);

    const byCategory = await db
      .select({ name: events.category, value: sql<number>`count(*)::int` })
      .from(events)
      .groupBy(events.category);

    const recentBookings = await db
      .select({ booking: bookings, event: events, buyer: users })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(6);

    return ok({
      stats: {
        totalUsers: uc.c,
        totalEvents: ec.c,
        totalBookings: bc.c,
        totalRevenue: rev.total,
        ticketsSold: ticketsSold.c,
        cancelledBookings: cancelled.c,
      },
      revByDay,
      byCategory,
      recentBookings: recentBookings.map((r) => ({
        id: r.booking.id,
        bookingCode: r.booking.bookingCode,
        customer: r.buyer?.name,
        event: r.event?.title,
        amount: r.booking.totalAmount,
        status: r.booking.bookingStatus,
        paymentStatus: r.booking.paymentStatus,
        createdAt: r.booking.createdAt,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
