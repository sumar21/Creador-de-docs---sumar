import type { NextRequest } from "next/server";

/**
 * Returns the canonical origin of the application.
 *
 * Priority:
 * 1. SITE_URL environment variable (most secure; set this in production)
 * 2. x-forwarded-proto / x-forwarded-host headers (only trusted behind a known reverse proxy)
 * 3. request.url origin (development fallback)
 *
 * Using x-forwarded-host from untrusted clients can expose SSRF vectors,
 * so SITE_URL should always be set in production environments.
 */
export function getRequestOrigin(request: NextRequest): string {
  const siteUrl = process.env.SITE_URL?.trim();
  if (siteUrl) {
    return siteUrl.replace(/\/+$/, "");
  }

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost) {
    const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";
    return `${protocol}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}
