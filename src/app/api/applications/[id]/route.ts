import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateApplicationSchema } from "@/lib/validation";
import { jsonError, zodErrorResponse } from "@/lib/http";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!application) return jsonError("Application not found", 404);
    return NextResponse.json(application, { status: 200 });
  } catch (err) {
    console.error("GET /api/applications/[id] failed", err);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const body: unknown = await req.json();
    const data = updateApplicationSchema.parse(body);

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
        ...(data.jobTitle !== undefined ? { jobTitle: data.jobTitle } : {}),
        ...(data.jobType !== undefined ? { jobType: data.jobType } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.appliedDate !== undefined ? { appliedDate: new Date(data.appliedDate) } : {}),
        ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof SyntaxError) return jsonError("Invalid JSON body", 400);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return jsonError("Application not found", 404);
    }
    console.error("PATCH /api/applications/[id] failed", err);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await prisma.application.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return jsonError("Application not found", 404);
    }
    console.error("DELETE /api/applications/[id] failed", err);
    return jsonError("Internal server error", 500);
  }
}
