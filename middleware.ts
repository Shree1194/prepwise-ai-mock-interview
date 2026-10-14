import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const start = Date.now();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-request-id", requestId);

  if (
    process.env.LOG_REQUESTS === "true" &&
    !req.nextUrl.pathname.startsWith("/_next")
  ) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "http_request",
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        durationMs: Date.now() - start,
      })
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
