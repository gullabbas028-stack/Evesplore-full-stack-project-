import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0].message, 422);
    const { email, password } = parsed.data;

    const [u] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!u) return fail("Invalid credentials", 401);

    const valid = await verifyPassword(password, u.password);
    if (!valid) return fail("Invalid credentials", 401);

    const token = await createToken({ id: u.id, role: u.role });
    await setAuthCookie(token);
    return ok({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar });
  } catch (e) {
    return handleError(e);
  }
}
