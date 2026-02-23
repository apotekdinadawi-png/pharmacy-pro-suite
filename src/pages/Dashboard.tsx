import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const peakHoursData = [
  { jam: "08", pelanggan: 12 },
  { jam: "09", pelanggan: 25 },
  { jam: "10", pelanggan: 38 },
  { jam: "11", pelanggan: 32 },
  { jam: "12", pelanggan: 20 },
  { jam: "13", pelanggan: 15 },
  { jam: "14", pelanggan: 28 },
  { jam: "15", pelanggan: 35 },
  { jam: "16", pelanggan: 42 },
  { jam: "17", pelanggan: 30 },
  { jam: "18", pelanggan: 22 },
  { jam: "19", pelanggan: 18 },
  { jam: "20", pelanggan: 8 },
];

const criticalStock = [
  { name: "Amoxicillin 500mg", stock: 5, min: 10 },
  { name: "Paracetamol 500mg", stock: 8, min: 20 },
  { name: "Omeprazole 20mg", stock: 3, min: 10 },
  { name: "Cetirizine 10mg", stock: 7, min: 15 },
];

const expiryItems = [
  { name: "Metformin 500mg", batch: "B2024-001", expiry: "2025-04-15", months: 2, level: "red" as const },
  { name: "Ibuprofen 400mg", batch: "B2024-033", expiry: "2025-06-20", months: 4, level: "yellow" as const },
  { name: "Ranitidine 150mg", batch: "B2024-012", expiry: "2025-05-10", months: 3, level: "red" as const },
  { name: "Vitamin C 500mg", batch: "B2024-055", expiry: "2025-08-01", months: 6, level: "yellow" as const },
];

const invoices = [
  { supplier: "PT Kimia Farma", amount: "Rp 12.500.000", due: "3 hari lagi", urgent: true },
  { supplier: "PT Kalbe Farma", amount: "Rp 8.200.000", due: "7 hari lagi", urgent: false },
  { supplier: "PT Dexa Medica", amount: "Rp 5.800.000", due: "14 hari lagi", urgent: false },
];

const summaryCards = [
  { title: "Penjualan Hari Ini", value: "Rp 4.250.000", change: "+12%", icon: DollarSign, color: "gradient-primary" },
  { title: "Total Transaksi", value: "47", change: "+8%", icon: ShoppingCart, color: "gradient-accent" },
  { title: "Profit Hari Ini", value: "Rp 1.380.000", change: "+5%", icon: TrendingUp, color: "gradient-primary" },
  { title: "Pelanggan", value: "39", change: "+15%", icon: Users, color: "gradient-accent" },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Selamat datang kembali! Berikut ringkasan apotek hari ini.</p>
      </div>

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
              <Clock className="w-4 h-4 text-primary" />
              Grafik Jam Ramai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="jam" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="pelanggan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Critical Stock */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Stok Kritis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Min: {item.min}</p>
                </div>
                <Badge variant="destructive" className="text-xs font-bold">
                  {item.stock}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Reminder */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-secondary" />
              Reminder Kadaluwarsa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiryItems.map((item) => (
              <div
                key={item.batch}
                className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  item.level === "red"
                    ? "bg-destructive/5 border-destructive/15"
                    : "bg-warning/5 border-warning/15"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Batch: {item.batch}</p>
                </div>
                <div className="text-right">
                  <Badge
                    className={`text-xs ${
                      item.level === "red"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-warning text-warning-foreground"
                    }`}
                  >
                    {item.months} bulan
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{item.expiry}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-info" />
              Status Faktur Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.supplier}
                className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  inv.urgent ? "bg-destructive/5 border-destructive/15" : "bg-muted/50 border-border"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.supplier}</p>
                  <p className="text-xs text-muted-foreground">{inv.amount}</p>
                </div>
                <Badge variant={inv.urgent ? "destructive" : "secondary"} className="text-xs">
                  {inv.due}
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
