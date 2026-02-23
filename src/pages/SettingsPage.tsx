import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SettingsPage = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Pengaturan</h1>
    <p className="text-sm text-muted-foreground mb-6">Kelola akun, role pengguna, dan konfigurasi sistem.</p>
    <Card className="glass-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Pengaturan Sistem</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Fitur Role-Based Access Control, manajemen pengguna, dan auto-backup akan segera tersedia.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default SettingsPage;
