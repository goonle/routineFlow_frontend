import "server-only";
import { getAccessToken, getRefreshToken, setSessionCookies, clearSessionCookies } from "@/lib/session";
import type { AuthTokens, ProblemDetails, ValidationProblemDetails } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_URL;

export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export class ApiProblemError extends Error {
  status: number;
  problem: ProblemDetails | ValidationProblemDetails;

  constructor(status: number, problem: ProblemDetails | ValidationProblemDetails) {
    super(problem.title ?? `Request failed with status ${status}`);
    this.name = "ApiProblemError";
    this.status = status;
    this.problem = problem;
  }
}

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function rawFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let problem: ProblemDetails | ValidationProblemDetails;
    try {
      problem = await res.json();
    } catch {
      problem = {
        type: "about:blank",
        title: res.statusText || "Request failed",
        status: res.status,
        instance: path,
        traceId: "",
      };
    }
    throw new ApiProblemError(res.status, problem);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function refreshSession(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearSessionCookies();
    throw new AuthError("No refresh token available");
  }

  let tokens: AuthTokens;
  try {
    tokens = await rawFetch<AuthTokens>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    await clearSessionCookies();
    throw new AuthError("Session refresh failed");
  }

  await setSessionCookies(tokens);
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, ...rest } = options;

  if (skipAuth) {
    return rawFetch<T>(path, rest);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new AuthError("No access token available");
  }

  const withAuthHeader = (token: string): RequestInit => ({
    ...rest,
    headers: new Headers({ ...Object.fromEntries(new Headers(rest.headers).entries()), Authorization: `Bearer ${token}` }),
  });

  try {
    return await rawFetch<T>(path, withAuthHeader(accessToken));
  } catch (err) {
    if (!(err instanceof ApiProblemError) || err.status !== 401) {
      throw err;
    }

    await refreshSession();
    const newAccessToken = await getAccessToken();
    if (!newAccessToken) {
      throw new AuthError("Session refresh did not yield a new access token");
    }

    try {
      return await rawFetch<T>(path, withAuthHeader(newAccessToken));
    } catch (retryErr) {
      if (retryErr instanceof ApiProblemError && retryErr.status === 401) {
        await clearSessionCookies();
        throw new AuthError("Session expired after refresh");
      }
      throw retryErr;
    }
  }
}
