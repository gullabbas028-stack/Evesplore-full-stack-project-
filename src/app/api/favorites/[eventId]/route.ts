import { db } from "@/db";
import { favorites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const user = await requireUser();
    const { eventId } = await params;
    const eid = Number(eventId);
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.eventId, eid)))
      .limit(1);
    if (existing.length) return ok({ favorited: true });
    await db.insert(favorites).values({ userId: user.id, eventId: eid });
    return ok({ favorited: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const user = await requireUser();
    const { eventId } = await params;
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.eventId, Number(eventId))));
    return ok({ favorited: false });
  } catch (e) {
    return handleError(e);
  }
}
