import { clearAuthCookie } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export async function POST() {
  try {
    await clearAuthCookie();
    return ok({ loggedOut: true });
  } catch (e) {
    return handleError(e);
  }
}
