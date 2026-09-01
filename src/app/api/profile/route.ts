import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await requireUser();
    const [u] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
    return ok({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      dateOfBirth: u.dateOfBirth,
      address: u.address,
      role: u.role,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const me = await requireUser();
    const b = await req.json();
    const patch: Record<string, unknown> = {
      name: b.name,
      phone: b.phone,
      avatar: b.avatar,
      dateOfBirth: b.dateOfBirth,
      address: b.address,
    };
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);
    const [u] = await db.update(users).set(patch).where(eq(users.id, me.id)).returning();
    return ok({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      dateOfBirth: u.dateOfBirth,
      address: u.address,
    });
  } catch (e) {
    return handleError(e);
  }
}
