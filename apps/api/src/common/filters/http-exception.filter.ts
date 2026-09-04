import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import { Sentry } from "../sentry";

/**
 * Maps every thrown exception to the consistent error envelope described in
 * docs/architecture/BACKEND_ARCHITECTURE.md: { error: { code, message, details } }.
 * Domain-specific exceptions (e.g. CampaignNotFundedException) should extend
 * HttpException with a response body already in this shape's `code`/`details`
 * so this filter only needs to pass it through.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Only genuinely unexpected errors (5xx, non-HttpException) go to
    // Sentry — a validated 400/403/404 is expected application behavior,
    // not an incident. Sentry.captureException no-ops if SENTRY_DSN isn't set.
    if (status >= 500) {
      // Sentry.captureException no-ops without a DSN — this console.error
      // is what actually shows up in Railway's Deploy Logs when it's
      // unset, so a 500 is never a silent, undiagnosable dead end.
      console.error("Unhandled exception:", exception);
      Sentry.captureException(exception);
    }

    const raw = exception instanceof HttpException ? exception.getResponse() : null;

    let code = "INTERNAL_ERROR";
    let message = "Something went wrong.";
    let details: Record<string, unknown> | undefined;

    if (raw && typeof raw === "object") {
      const body = raw as Record<string, unknown>;
      code = (body.code as string) ?? httpStatusToCode(status);
      message = (body.message as string) ?? message;
      details = (body.details as Record<string, unknown>) ?? undefined;
    } else if (typeof raw === "string") {
      message = raw;
      code = httpStatusToCode(status);
    }

    response.status(status).json({ error: { code, message, details } });
  }
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHENTICATED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    default:
      return "INTERNAL_ERROR";
  }
}
