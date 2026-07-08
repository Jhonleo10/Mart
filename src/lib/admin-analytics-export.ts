import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AdminAnalyticsReport } from "@/lib/admin-analytics-report";
import { formatCurrency, formatDate } from "@/lib/utils";

const BRAND_BLUE: [number, number, number] = [0, 118, 223];
const BRAND_GREEN: [number, number, number] = [0, 195, 103];

function statusRows(items: { name: string; value: number }[]) {
  return items.map((row) => [row.name.replace(/_/g, " "), row.value]);
}

export async function buildAnalyticsExcel(report: AdminAnalyticsReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Genius Mart";
  workbook.created = report.generatedAt;

  const summary = workbook.addWorksheet("Summary");
  summary.columns = [
    { header: "Metric", key: "metric", width: 28 },
    { header: "Value", key: "value", width: 22 },
  ];
  summary.getRow(1).font = { bold: true };
  summary.addRows([
    { metric: "Report period (days)", value: report.days },
    { metric: "Generated at", value: formatDate(report.generatedAt) },
    { metric: "Revenue (period)", value: formatCurrency(report.analytics.revenue) },
    { metric: "New leads (period)", value: report.analytics.bookings },
    { metric: "New users (period)", value: report.analytics.newUsers },
    { metric: "New companies (period)", value: report.analytics.newCompanies },
  ]);

  const companySheet = workbook.addWorksheet("Company Status");
  companySheet.addRow(["Status", "Count"]);
  companySheet.getRow(1).font = { bold: true };
  statusRows(report.analytics.companyStatus).forEach((row) => companySheet.addRow(row));

  const productSheet = workbook.addWorksheet("Product Status");
  productSheet.addRow(["Status", "Count"]);
  productSheet.getRow(1).font = { bold: true };
  statusRows(report.analytics.productStatus).forEach((row) => productSheet.addRow(row));

  const rolesSheet = workbook.addWorksheet("Users by Role");
  rolesSheet.addRow(["Role", "Count"]);
  rolesSheet.getRow(1).font = { bold: true };
  statusRows(report.analytics.roleCounts).forEach((row) => rolesSheet.addRow(row));

  const trendingSheet = workbook.addWorksheet("Trending Products");
  trendingSheet.addRow(["Product", "Company", "Category", "Trending Score", "Views"]);
  trendingSheet.getRow(1).font = { bold: true };
  report.trending.forEach((p) => {
    trendingSheet.addRow([
      p.name,
      p.company.name,
      p.category.name,
      p.trendingScore,
      p.viewCount,
    ]);
  });

  const leadsSheet = workbook.addWorksheet("All Leads");
  leadsSheet.addRow([
    "Name",
    "Email",
    "Product",
    "Company",
    "Type",
    "Status",
    "Created",
  ]);
  leadsSheet.getRow(1).font = { bold: true };
  report.leads.forEach((lead) => {
    leadsSheet.addRow([
      lead.name,
      lead.user?.email ?? lead.user?.name ?? "—",
      lead.product?.name ?? "—",
      lead.company.name,
      lead.type,
      lead.status,
      formatDate(lead.createdAt),
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function buildAnalyticsPdf(report: AdminAnalyticsReport): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const title = "Genius Mart — Analytics Report";

  doc.setFontSize(18);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(title, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Period: last ${report.days} days · Generated ${formatDate(report.generatedAt)}`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [["Metric", "Value"]],
    body: [
      ["Revenue (period)", formatCurrency(report.analytics.revenue)],
      ["New leads (period)", String(report.analytics.bookings)],
      ["New users (period)", String(report.analytics.newUsers)],
      ["New companies (period)", String(report.analytics.newCompanies)],
    ],
    theme: "grid",
    headStyles: { fillColor: BRAND_BLUE },
    styles: { fontSize: 9 },
  });

  const summaryEnd = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 60;

  autoTable(doc, {
    startY: summaryEnd + 8,
    head: [["Company status", "Count"]],
    body: statusRows(report.analytics.companyStatus),
    theme: "striped",
    headStyles: { fillColor: BRAND_GREEN },
    styles: { fontSize: 8 },
  });

  const companyEnd = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 90;

  autoTable(doc, {
    startY: companyEnd + 6,
    head: [["Product status", "Count"]],
    body: statusRows(report.analytics.productStatus),
    theme: "striped",
    headStyles: { fillColor: BRAND_GREEN },
    styles: { fontSize: 8 },
  });

  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Trending products", 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [["Product", "Company", "Category", "Score", "Views"]],
    body: report.trending.slice(0, 25).map((p) => [
      p.name,
      p.company.name,
      p.category.name,
      String(p.trendingScore),
      String(p.viewCount),
    ]),
    theme: "grid",
    headStyles: { fillColor: BRAND_BLUE },
    styles: { fontSize: 8 },
  });

  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("All leads", 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [["Name", "Product", "Company", "Type", "Status", "Date"]],
    body: report.leads.slice(0, 200).map((lead) => [
      lead.name,
      lead.product?.name ?? "—",
      lead.company.name,
      lead.type,
      lead.status.replace(/_/g, " "),
      formatDate(lead.createdAt),
    ]),
    theme: "grid",
    headStyles: { fillColor: BRAND_BLUE },
    styles: { fontSize: 7 },
  });

  if (report.leads.length > 200) {
    const leadsEnd = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 280;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Showing 200 of ${report.leads.length} leads. Export Excel for the full list.`, 14, leadsEnd + 8);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
