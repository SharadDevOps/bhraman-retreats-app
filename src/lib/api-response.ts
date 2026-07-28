import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function apiSuccess<T>(data: T, options?: { status?: number; meta?: Record<string, unknown> }) {
  return NextResponse.json(
    { data, ...(options?.meta ? { meta: options.meta } : {}) },
    { status: options?.status ?? 200 },
  );
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export function validationError(errors: Record<string, string>) {
  return apiError(422, "VALIDATION_ERROR", "The request contains invalid fields.", { fields: errors });
}

export function handleApiError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return apiError(409, "CONFLICT", "A record with that unique value already exists.");
    }
    if (error.code === "P2025") {
      return apiError(404, "NOT_FOUND", "The requested record was not found.");
    }
    if (error.code === "P2003") {
      return apiError(409, "RELATION_CONFLICT", "The record is referenced by another resource.");
    }
  }
  console.error("CMS API error", error);
  return apiError(500, "INTERNAL_ERROR", "The request could not be completed.");
}
