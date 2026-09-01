import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0].message, 422);
    const { name, email, password } = parsed.data;

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length) return fail("Email already registered", 409);

    const hashed = await hashPassword(password);
    const [u] = await db
      .insert(users)
      .values({ name, email: email.toLowerCase(), password: hashed, role: "USER" })
      .returning();

    const token = await createToken({ id: u.id, role: u.role });
    await setAuthCookie(token);
    return ok({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar }, 201);
  } catch (e) {
    return handleError(e);
  }
}
