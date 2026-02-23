import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const Customers = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Pelanggan (CRM)</h1>
    <p className="text-sm text-muted-foreground mb-6">Riwayat pengobatan, manajemen alergi, dan poin loyalitas.</p>
    <Card className="glass-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Modul Pelanggan</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Fitur CRM termasuk riwayat pengobatan pasien, peringatan alergi, dan poin loyalitas akan segera tersedia.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default Customers;
