import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchDrugsTool from "./tools/search-drugs";
import lowStockTool from "./tools/low-stock";
import salesSummaryTool from "./tools/sales-summary";
import stockCardTool from "./tools/stock-card";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pharmacy-pro-suite",
  title: "Pharmacy Pro Suite",
  version: "0.1.0",
  instructions:
    "Tools untuk Apotek Dinadawi (ApotekPro). Gunakan `search_drugs` untuk mencari obat & stok, `low_stock_report` untuk obat yang perlu dipesan, `get_stock_card` untuk riwayat mutasi stok satu obat, dan `sales_summary` untuk ringkasan omzet penjualan. Semua data dibaca sebagai pengguna yang sedang masuk.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchDrugsTool, lowStockTool, stockCardTool, salesSummaryTool],
});
