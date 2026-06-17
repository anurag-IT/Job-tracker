import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function zodErrorResponse(err: ZodError) {
  return jsonError("Validation failed", 400, err.flatten().fieldErrors);
}
