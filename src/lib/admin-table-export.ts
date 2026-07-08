import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

const BRAND_BLUE: [number, number, number] = [0, 118, 223];

type ExportColumn = { header: string; key: string; width?: number };

async function buildWorkbook(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, string | number | boolean | null | undefined>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Genius Mart Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31));
  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? 18,
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEEF6FF" },
  };
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function buildPdf(
  title: string,
  head: string[],
  body: (string | number)[][],
): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated ${formatDate(new Date())}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [head],
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: BRAND_BLUE, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  return Buffer.from(doc.output("arraybuffer"));
}

export async function exportCompaniesExcel(
  rows: {
    name: string;
    owner: string;
    email: string;
    status: string;
    products: number;
    leads: number;
    health: string;
    plan: string;
    createdAt: Date;
  }[],
) {
  return buildWorkbook(
    "Companies",
    [
      { header: "Company", key: "name", width: 28 },
      { header: "Owner", key: "owner", width: 22 },
      { header: "Email", key: "email", width: 28 },
      { header: "Status", key: "status", width: 14 },
      { header: "Products", key: "products", width: 12 },
      { header: "Leads", key: "leads", width: 10 },
      { header: "Health", key: "health", width: 16 },
      { header: "Plan", key: "plan", width: 16 },
      { header: "Joined", key: "joined", width: 14 },
    ],
    rows.map((r) => ({
      name: r.name,
      owner: r.owner,
      email: r.email,
      status: r.status,
      products: r.products,
      leads: r.leads,
      health: r.health,
      plan: r.plan ?? "—",
      joined: formatDate(r.createdAt),
    })),
  );
}

export function exportCompaniesPdf(
  rows: Parameters<typeof exportCompaniesExcel>[0],
) {
  return buildPdf(
    "Genius Mart — Companies",
    ["Company", "Owner", "Status", "Products", "Leads", "Health", "Joined"],
    rows.map((r) => [
      r.name,
      r.owner,
      r.status,
      r.products,
      r.leads,
      r.health,
      formatDate(r.createdAt),
    ]),
  );
}

export async function exportProductsExcel(
  rows: {
    name: string;
    company: string;
    category: string;
    status: string;
    verified: boolean;
    featured: boolean;
    views: number;
    createdAt: Date;
  }[],
) {
  return buildWorkbook(
    "Products",
    [
      { header: "Product", key: "name", width: 28 },
      { header: "Company", key: "company", width: 22 },
      { header: "Category", key: "category", width: 18 },
      { header: "Status", key: "status", width: 14 },
      { header: "Verified", key: "verified", width: 10 },
      { header: "Featured", key: "featured", width: 10 },
      { header: "Views", key: "views", width: 10 },
      { header: "Created", key: "created", width: 14 },
    ],
    rows.map((r) => ({
      name: r.name,
      company: r.company,
      category: r.category,
      status: r.status,
      verified: r.verified ? "Yes" : "No",
      featured: r.featured ? "Yes" : "No",
      views: r.views,
      created: formatDate(r.createdAt),
    })),
  );
}

export function exportProductsPdf(rows: Parameters<typeof exportProductsExcel>[0]) {
  return buildPdf(
    "Genius Mart — Products",
    ["Product", "Company", "Category", "Status", "Verified", "Views", "Created"],
    rows.map((r) => [
      r.name,
      r.company,
      r.category,
      r.status,
      r.verified ? "Yes" : "No",
      r.views,
      formatDate(r.createdAt),
    ]),
  );
}

export async function exportUsersExcel(
  rows: {
    name: string;
    email: string;
    role: string;
    status: string;
    company: string;
    createdAt: Date;
  }[],
) {
  return buildWorkbook(
    "Users",
    [
      { header: "Name", key: "name", width: 22 },
      { header: "Email", key: "email", width: 28 },
      { header: "Role", key: "role", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Company", key: "company", width: 22 },
      { header: "Joined", key: "joined", width: 14 },
    ],
    rows.map((r) => ({
      name: r.name,
      email: r.email,
      role: r.role,
      status: r.status,
      company: r.company,
      joined: formatDate(r.createdAt),
    })),
  );
}

export function exportUsersPdf(rows: Parameters<typeof exportUsersExcel>[0]) {
  return buildPdf(
    "Genius Mart — Users",
    ["Name", "Email", "Role", "Status", "Company", "Joined"],
    rows.map((r) => [
      r.name,
      r.email,
      r.role,
      r.status,
      r.company,
      formatDate(r.createdAt),
    ]),
  );
}

export async function exportPaymentsExcel(
  rows: {
    company: string;
    type: string;
    amount: number;
    status: string;
    orderId: string;
    createdAt: Date;
  }[],
) {
  return buildWorkbook(
    "Payments",
    [
      { header: "Company", key: "company", width: 24 },
      { header: "Type", key: "type", width: 14 },
      { header: "Amount", key: "amount", width: 14 },
      { header: "Status", key: "status", width: 12 },
      { header: "Order ID", key: "orderId", width: 24 },
      { header: "Date", key: "date", width: 14 },
    ],
    rows.map((r) => ({
      company: r.company,
      type: r.type,
      amount: formatCurrency(r.amount),
      status: r.status,
      orderId: r.orderId,
      date: formatDate(r.createdAt),
    })),
  );
}

export function exportPaymentsPdf(rows: Parameters<typeof exportPaymentsExcel>[0]) {
  return buildPdf(
    "Genius Mart — Payments",
    ["Company", "Type", "Amount", "Status", "Order ID", "Date"],
    rows.map((r) => [
      r.company,
      r.type,
      formatCurrency(r.amount),
      r.status,
      r.orderId,
      formatDate(r.createdAt),
    ]),
  );
}
