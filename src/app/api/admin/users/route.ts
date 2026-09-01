import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    return ok({ users: rows });
  } catch (e) {
    return handleError(e);
  }
}
