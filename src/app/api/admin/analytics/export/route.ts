import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminAnalyticsReport } from "@/lib/admin-analytics-report";
import { buildAnalyticsExcel, buildAnalyticsPdf } from "@/lib/admin-analytics-export";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "xlsx";
  const days = Number(searchParams.get("days") ?? 30);

  try {
    const report = await getAdminAnalyticsReport(days);
    const stamp = report.generatedAt.toISOString().slice(0, 10);

    if (format === "pdf") {
      const buffer = buildAnalyticsPdf(report);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="dgm-analytics-${report.days}d-${stamp}.pdf"`,
        },
      });
    }

    if (format === "xlsx" || format === "excel") {
      const buffer = await buildAnalyticsExcel(report);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dgm-analytics-${report.days}d-${stamp}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format. Use pdf or xlsx." }, { status: 400 });
  } catch (error) {
    console.error("[admin/analytics/export]", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
