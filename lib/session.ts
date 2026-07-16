import "server-only";
import { cookies } from "next/headers";
import type { AuthTokens } from "@/lib/types";

// Only usable from Server Components / Server Actions / Route Handlers.
// middleware.ts must read request.cookies directly — next/headers' cookies()
// is not available in that context.

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days; client-side hint only, backend enforces real validity

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function setSessionCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  const accessTokenMaxAgeSeconds = Math.max(
    1,
    Math.floor((new Date(tokens.accessTokenExpiresAt).getTime() - Date.now()) / 1000)
  );

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: accessTokenMaxAgeSeconds,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
