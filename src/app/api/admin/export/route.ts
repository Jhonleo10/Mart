import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { userRepository } from "@/repositories/user.repository";
import { paymentRepository } from "@/repositories/payment.repository";
import { getVendorHealthScores } from "@/lib/admin-vendor-health";
import {
  exportCompaniesExcel,
  exportCompaniesPdf,
  exportPaymentsExcel,
  exportPaymentsPdf,
  exportProductsExcel,
  exportProductsPdf,
  exportUsersExcel,
  exportUsersPdf,
} from "@/lib/admin-table-export";
import type { CompanyStatus, PaymentStatus, ProductStatus, Role, UserStatus } from "@prisma/client";

const EXPORT_LIMIT = 5000;

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");
  const format = searchParams.get("format") ?? "xlsx";
  const stamp = new Date().toISOString().slice(0, 10);

  try {
    if (entity === "companies") {
      const status = searchParams.get("status") as CompanyStatus | null;
      const q = searchParams.get("q") ?? undefined;
      const industry = searchParams.get("industry") ?? undefined;
      const [companies] = await companyRepository.list({
        page: 1,
        limit: EXPORT_LIMIT,
        status: status || undefined,
        industry,
        q,
      });
      const healthMap = await getVendorHealthScores(companies.map((c) => c.id));
      const rows = companies.map((c) => {
        const health = healthMap.get(c.id);
        return {
          name: c.name,
          owner: c.ownerName ?? c.user.name ?? "—",
          email: c.contactEmail,
          status: c.status,
          products: c._count.products,
          leads: c._count.bookings,
          health: health ? `${health.score} (${health.label})` : "—",
          plan: c.selectedPlan ?? "—",
          createdAt: c.createdAt,
        };
      });

      if (format === "pdf") {
        const buffer = exportCompaniesPdf(rows);
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="dgm-companies-${stamp}.pdf"`,
          },
        });
      }

      const buffer = await exportCompaniesExcel(rows);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dgm-companies-${stamp}.xlsx"`,
        },
      });
    }

    if (entity === "products") {
      const status = searchParams.get("status") as ProductStatus | null;
      const verified = searchParams.get("verified") as "true" | "false" | null;
      const category = searchParams.get("category") ?? undefined;
      const q = searchParams.get("q") ?? undefined;
      const [products] = await productRepository.adminList({
        page: 1,
        limit: EXPORT_LIMIT,
        status: status || undefined,
        verified: verified || undefined,
        categoryId: category,
        q,
      });
      const rows = products.map((p) => ({
        name: p.name,
        company: p.company.name,
        category: p.category.name,
        status: p.status,
        verified: p.adminVerified,
        featured: p.featured,
        views: p.viewCount,
        createdAt: p.createdAt,
      }));

      if (format === "pdf") {
        const buffer = exportProductsPdf(rows);
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="dgm-products-${stamp}.pdf"`,
          },
        });
      }

      const buffer = await exportProductsExcel(rows);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dgm-products-${stamp}.xlsx"`,
        },
      });
    }

    if (entity === "users") {
      const role = searchParams.get("role") as Role | null;
      const status = searchParams.get("status") as UserStatus | null;
      const q = searchParams.get("q") ?? undefined;
      const [users] = await userRepository.list({
        page: 1,
        limit: EXPORT_LIMIT,
        role: role || undefined,
        status: status || undefined,
        q,
      });
      const rows = users.map((u) => ({
        name: u.name ?? "—",
        email: u.email,
        role: u.role,
        status: u.status,
        company: u.company?.name ?? "—",
        createdAt: u.createdAt,
      }));

      if (format === "pdf") {
        const buffer = exportUsersPdf(rows);
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="dgm-users-${stamp}.pdf"`,
          },
        });
      }

      const buffer = await exportUsersExcel(rows);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dgm-users-${stamp}.xlsx"`,
        },
      });
    }

    if (entity === "payments") {
      const status = searchParams.get("status") as PaymentStatus | null;
      const [payments] = await paymentRepository.adminList({
        page: 1,
        limit: EXPORT_LIMIT,
        status: status || undefined,
      });
      const rows = payments.map((p) => ({
        company: p.company.name,
        type: p.type,
        amount: p.amount,
        status: p.status,
        orderId: p.razorpayOrderId ?? "—",
        createdAt: p.createdAt,
      }));

      if (format === "pdf") {
        const buffer = exportPaymentsPdf(rows);
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="dgm-payments-${stamp}.pdf"`,
          },
        });
      }

      const buffer = await exportPaymentsExcel(rows);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dgm-payments-${stamp}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  } catch (error) {
    console.error("[admin/export]", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
