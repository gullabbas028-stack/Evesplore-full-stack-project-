import { db } from "@/db";
import { venues, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [v] = await db.select().from(venues).where(eq(venues.id, Number(id))).limit(1);
    if (!v) return fail("Venue not found", 404);
    const evs = await db.select().from(events).where(eq(events.venueId, Number(id)));
    return ok({ ...v, events: evs });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const b = await req.json();
    const patch: Record<string, unknown> = {
      name: b.name,
      description: b.description,
      address: b.address,
      city: b.city,
      image: b.image,
      capacity: b.capacity ? Number(b.capacity) : undefined,
      seatLayout: b.seatLayout,
    };
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);
    const [v] = await db.update(venues).set(patch).where(eq(venues.id, Number(id))).returning();
    if (!v) return fail("Venue not found", 404);
    return ok(v);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(venues).where(eq(venues.id, Number(id)));
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
