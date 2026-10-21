import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";

function allowedOrigin(): string {
  return (process.env.CORS_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");
}

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    // Drop trailing slash inconsistencies; compare scheme+host+port only.
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * CSRF defense for cookie-authenticated /auth/refresh and /auth/logout.
 *
 * Policy:
 * - If Origin is present: it MUST equal CORS_ORIGIN. A foreign Origin is
 *   always rejected, even when X-Soma-Requested-With is set.
 * - If Origin is absent: Referer must parse to the same origin as CORS_ORIGIN
 *   (exact URL.origin match — not string prefix).
 * - Custom client headers alone never authorize a request.
 */
@Injectable()
export class AuthOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const allowed = allowedOrigin();
    const originHeader = req.headers.origin;
    const refererHeader = req.headers.referer;

    if (typeof originHeader === "string" && originHeader.length > 0) {
      const origin = normalizeOrigin(originHeader);
      if (!origin || origin !== allowed) {
        throw new ForbiddenException("Origin not allowed");
      }
      return true;
    }

    if (typeof refererHeader === "string" && refererHeader.length > 0) {
      const refererOrigin = normalizeOrigin(refererHeader);
      if (refererOrigin && refererOrigin === allowed) {
        return true;
      }
      throw new ForbiddenException("Origin not allowed");
    }

    throw new ForbiddenException("Origin not allowed");
  }
}
