import type { NextRequest } from "next/server";

export function getRequestOrigin(request: NextRequest): string {
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
