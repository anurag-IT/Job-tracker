import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUSES, type Status } from "@/lib/validation";
import { jsonError } from "@/lib/http";

export async function GET() {
  try {
    const grouped = await prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const byStatus: Record<Status, number> = {
      APPLIED: 0,
      INTERVIEWING: 0,
      OFFER: 0,
      REJECTED: 0,
    };

    for (const row of grouped) {
      byStatus[row.status] = row._count._all;
    }

    const total = STATUSES.reduce((sum, s) => sum + byStatus[s], 0);

    return NextResponse.json({ total, byStatus }, { status: 200 });
  } catch (err) {
    console.error("GET /api/applications/stats failed", err);
    return jsonError("Internal server error", 500);
  }
}
