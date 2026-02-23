import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

const Procurement = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Pengadaan</h1>
    <p className="text-sm text-muted-foreground mb-6">Kelola surat pesanan, database supplier, dan history pembelian.</p>
    <Card className="glass-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
          <Truck className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Modul Pengadaan</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Fitur Surat Pesanan otomatis, SP Narkotika/Psikotropika, database supplier, dan history pembelian akan segera tersedia.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default Procurement;
