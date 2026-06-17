import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema, listQuerySchema } from "@/lib/validation";
import { jsonError, zodErrorResponse } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { status, search } = parsed.data;

    const where: Prisma.ApplicationWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { jobTitle: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const applications = await prisma.application.findMany({
      where,
      orderBy: { appliedDate: "desc" },
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (err) {
    console.error("GET /api/applications failed", err);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const data = createApplicationSchema.parse(body);

    const created = await prisma.application.create({
      data: {
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobType: data.jobType,
        status: data.status,
        appliedDate: new Date(data.appliedDate),
        notes: data.notes ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof SyntaxError) return jsonError("Invalid JSON body", 400);
    console.error("POST /api/applications failed", err);
    return jsonError("Internal server error", 500);
  }
}
