import { db } from "@/db";
import { venues, events } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_LAYOUT } from "@/lib/seats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(venues).orderBy(venues.name);
    const counts = await db
      .select({ venueId: events.venueId, c: sql<number>`count(*)::int` })
      .from(events)
      .groupBy(events.venueId);
    const countMap = new Map(counts.map((c) => [c.venueId, c.c]));
    return ok({ venues: rows.map((v) => ({ ...v, upcomingEvents: countMap.get(v.id) || 0 })) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    const [v] = await db
      .insert(venues)
      .values({
        name: b.name,
        description: b.description || "",
        address: b.address || "",
        city: b.city,
        image: b.image || null,
        capacity: Number(b.capacity) || 150,
        seatLayout: b.seatLayout || DEFAULT_LAYOUT,
      })
      .returning();
    return ok(v, 201);
  } catch (e) {
    return handleError(e);
  }
}
