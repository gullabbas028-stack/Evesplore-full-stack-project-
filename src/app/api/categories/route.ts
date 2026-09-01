import { db } from "@/db";
import { categories, events } from "@/db/schema";
import { sql } from "drizzle-orm";
import { ok, handleError, slugify } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(categories.name);
    const counts = await db
      .select({ category: events.category, c: sql<number>`count(*)::int` })
      .from(events)
      .groupBy(events.category);
    const map = new Map(counts.map((c) => [c.category, c.c]));
    return ok({ categories: rows.map((c) => ({ ...c, eventCount: map.get(c.name) || 0 })) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    const [c] = await db
      .insert(categories)
      .values({ name: b.name, slug: slugify(b.name), icon: b.icon || "music", image: b.image || null })
      .returning();
    return ok(c, 201);
  } catch (e) {
    return handleError(e);
  }
}
