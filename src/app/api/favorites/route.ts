import { db } from "@/db";
import { favorites, events, venues } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({ event: events, venueName: venues.name, venueCity: venues.city, favId: favorites.id })
      .from(favorites)
      .innerJoin(events, eq(favorites.eventId, events.id))
      .leftJoin(venues, eq(events.venueId, venues.id))
      .where(eq(favorites.userId, user.id));
    return ok({
      favorites: rows.map((r) => ({ ...r.event, venueName: r.venueName, venueCity: r.venueCity })),
      ids: rows.map((r) => r.event.id),
    });
  } catch (e) {
    return handleError(e);
  }
}
