import { db } from "@/db";
import { events, venues } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    if (!eventId) return fail("Invalid event", 400);

    const [row] = await db
      .select({ event: events, venue: venues })
      .from(events)
      .leftJoin(venues, eq(events.venueId, venues.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (!row) return fail("Event not found", 404);

    // increment views (best-effort)
    await db.update(events).set({ views: sql`${events.views} + 1` }).where(eq(events.id, eventId));

    // similar events by category
    const similar = await db
      .select()
      .from(events)
      .where(eq(events.category, row.event.category))
      .limit(4);

    return ok({
      ...row.event,
      venue: row.venue,
      similar: similar.filter((s) => s.id !== eventId).slice(0, 3),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const eventId = Number(id);
    const b = await req.json();
    const ticketTypes = b.ticketTypes;
    const patch: Record<string, unknown> = {
      title: b.title,
      description: b.description,
      category: b.category,
      tags: b.tags,
      banner: b.banner,
      images: b.images,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      venueId: b.venueId ? Number(b.venueId) : null,
      organizer: b.organizer,
      rules: b.rules,
      ageRestriction: b.ageRestriction,
      status: b.status,
      featured: b.featured,
      popular: b.popular,
      totalCapacity: b.totalCapacity ? Number(b.totalCapacity) : undefined,
    };
    if (ticketTypes) {
      patch.ticketTypes = ticketTypes;
      const prices = ticketTypes.map((t: { price: number }) => Number(t.price));
      patch.startingPrice = String(prices.length ? Math.min(...prices) : 0);
    }
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

    const [ev] = await db.update(events).set(patch).where(eq(events.id, eventId)).returning();
    if (!ev) return fail("Event not found", 404);
    return ok(ev);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(events).where(eq(events.id, Number(id)));
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
