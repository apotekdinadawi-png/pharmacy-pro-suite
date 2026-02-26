import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, AlertTriangle, Clock, FileText, Package, DollarSign, ShoppingCart, Users, Bell
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useProcurementStore } from "@/stores/useProcurementStore";
import { formatRupiah, formatNumber } from "@/lib/currency";

const peakHoursData = [
  { jam: "08", pelanggan: 12 }, { jam: "09", pelanggan: 25 }, { jam: "10", pelanggan: 38 },
  { jam: "11", pelanggan: 32 }, { jam: "12", pelanggan: 20 }, { jam: "13", pelanggan: 15 },
  { jam: "14", pelanggan: 28 }, { jam: "15", pelanggan: 35 }, { jam: "16", pelanggan: 42 },
  { jam: "17", pelanggan: 30 }, { jam: "18", pelanggan: 22 }, { jam: "19", pelanggan: 18 },
  { jam: "20", pelanggan: 8 },
];

const summaryCards = [
  { title: "Penjualan Hari Ini", value: "Rp 4.250.000", change: "+12%", icon: DollarSign, color: "gradient-primary" },
  { title: "Total Transaksi", value: "47", change: "+8%", icon: ShoppingCart, color: "gradient-accent" },
  { title: "Profit Hari Ini", value: "Rp 1.380.000", change: "+5%", icon: TrendingUp, color: "gradient-primary" },
  { title: "Pelanggan", value: "39", change: "+15%", icon: Users, color: "gradient-accent" },
];

const Dashboard = () => {
  const { drugs, priceAlerts, grnEntries } = useInventoryStore();
  const { inventory } = useSettingsStore();
  const { invoiceTrackers } = useProcurementStore();

  // Dynamic critical stock from settings threshold
  const criticalStock = drugs.filter((d) => d.stock <= inventory.stokKritis);

  // Dynamic expiry — pull from GRN entries with exp dates
  const today = new Date();
  const expiryItems = grnEntries.flatMap((grn) =>
    grn.items.filter((i) => i.expDate).map((i) => {
      const expDate = new Date(i.expDate + "-01");
      const monthsLeft = Math.max(0, Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return { name: i.drugName, batch: i.batch, expiry: i.expDate, months: monthsLeft };
    })
  ).filter((i) => i.months <= inventory.reminderKadaluwarsa).slice(0, 6);

  // Dynamic invoice countdown
  const unpaidInvoices = invoiceTrackers.filter((t) => t.status === 'Belum Bayar').map((t) => {
    const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...t, daysLeft };
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Selamat datang kembali! Data dinamis dari Pengaturan & Inventaris.</p>
      </div>

      {/* Price alerts */}
      {priceAlerts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
          <Bell className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <div className="text-sm">
            <b className="text-foreground">Notifikasi Harga Beli Naik:</b>
            {priceAlerts.slice(0, 3).map((a, i) => (
              <span key={i} className="block text-muted-foreground">{a.drugName}: {formatRupiah(a.oldPrice)} → {formatRupiah(a.newPrice)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="glass-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                  <span className="text-xs font-medium text-primary">{card.change} dari kemarin</span>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Grafik Jam Ramai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="jam" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="pelanggan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Critical Stock — Dynamic from Settings.stokKritis */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Stok Kritis
              <Badge variant="outline" className="text-xs ml-auto">≤ {inventory.stokKritis} unit</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Semua stok aman 👍</p>
            ) : criticalStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                </div>
                <Badge variant="destructive" className="text-xs font-bold">{item.stock}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Reminder — Dynamic from Settings.reminderKadaluwarsa */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-secondary" /> Reminder Kadaluwarsa
              <Badge variant="outline" className="text-xs ml-auto">≤ {inventory.reminderKadaluwarsa} bulan</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiryItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ada obat mendekati kadaluwarsa. Input Barang Masuk untuk tracking.</p>
            ) : expiryItems.map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${item.months <= 1 ? "bg-destructive/5 border-destructive/15" : "bg-warning/5 border-warning/15"}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Batch: {item.batch}</p>
                </div>
                <div className="text-right">
                  <Badge className={`text-xs ${item.months <= 1 ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}`}>{item.months} bulan</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{item.expiry}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invoice Status — Dynamic from Procurement store */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-info" /> Status Faktur Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unpaidInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Semua faktur lunas atau belum ada data.</p>
            ) : unpaidInvoices.map((inv) => (
              <div key={inv.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${inv.daysLeft <= 3 ? "bg-destructive/5 border-destructive/15" : "bg-muted/50 border-border"}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.supplierName}</p>
                  <p className="text-xs text-muted-foreground">{formatRupiah(inv.totalAmount)} — {inv.invoiceNo}</p>
                </div>
                <Badge variant={inv.daysLeft <= 3 ? "destructive" : "secondary"} className="text-xs">
                  {inv.daysLeft > 0 ? `${inv.daysLeft} hari lagi` : inv.daysLeft === 0 ? "Hari ini" : `Terlambat ${Math.abs(inv.daysLeft)}hr`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
