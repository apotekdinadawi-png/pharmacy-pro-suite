import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const Reports = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Laporan</h1>
    <p className="text-sm text-muted-foreground mb-6">Laporan laba rugi, fast/slow moving, SIPNAP, dan penjualan per kasir.</p>
    <Card className="glass-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Modul Laporan</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Fitur laporan lengkap termasuk laba rugi, fast/slow moving, SIPNAP, dan penjualan per kasir akan segera tersedia.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default Reports;
