import { NextResponse } from "next/server";

function getAllowedOrigins(req: Request): Set<string> {
  const requestOrigin = new URL(req.url).origin;
  const configured = [
    requestOrigin,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];

  // Next's dev server normalizes request URLs to localhost even when the
  // browser uses 127.0.0.1. Permit only loopback aliases on this same port.
  const requestUrl = new URL(req.url);
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(requestUrl.hostname)) {
    configured.push(`${requestUrl.protocol}//localhost:${requestUrl.port || "80"}`, `${requestUrl.protocol}//127.0.0.1:${requestUrl.port || "80"}`);
  }

  return new Set(configured.map((origin) => origin.replace(/\/$/, "")));
}

export function enforceSameOrigin(req: Request): NextResponse | null {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const providedSecret = req.headers.get("x-prepwise-internal-secret");
  if (internalSecret && providedSecret && providedSecret === internalSecret) {
    return null;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowedOrigins = getAllowedOrigins(req);

  if (!origin && !referer && process.env.NODE_ENV !== "production") {
    return null;
  }

  let candidate = origin || "";
  try {
    if (!candidate && referer) candidate = new URL(referer).origin;
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  if (candidate && allowedOrigins.has(candidate.replace(/\/$/, ""))) {
    return null;
  }

  return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
}

export function sanitiseFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function hasPdfMagicNumber(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}
