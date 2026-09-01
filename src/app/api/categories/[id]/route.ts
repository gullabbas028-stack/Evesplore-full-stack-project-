import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(categories).where(eq(categories.id, Number(id)));
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
