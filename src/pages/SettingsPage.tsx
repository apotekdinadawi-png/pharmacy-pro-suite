import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Package, Database, Star, ShieldCheck, Plus, X, Save, Trash2, Receipt, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettingsStore, type RoleName, type ApotekerPendamping } from "@/stores/useSettingsStore";
import { toast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/currency";

const allMenus = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'transaksi', label: 'Transaksi / Kasir' },
  { key: 'inventaris', label: 'Inventaris' },
  { key: 'pengadaan', label: 'Pengadaan' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'pelanggan', label: 'Pelanggan' },
  { key: 'manajemen_user', label: 'Manajemen User' },
  { key: 'pengaturan', label: 'Pengaturan' },
];

// ==================== TAB BISNIS ====================
const BisnisTab = () => {
  const { business, setBusiness } = useSettingsStore();
  const [form, setForm] = useState(business);

  useEffect(() => { setForm(business); }, [business]);

  const handleSave = () => {
    setBusiness(form);
    toast({ title: "Tersimpan", description: "Pengaturan bisnis berhasil disimpan." });
  };

  const addPendamping = () => {
    setForm({ ...form, apotekerPendamping: [...form.apotekerPendamping, { nama: '', sipa: '' }] });
  };

  const removePendamping = (idx: number) => {
    setForm({ ...form, apotekerPendamping: form.apotekerPendamping.filter((_, i) => i !== idx) });
  };

  const updatePendamping = (idx: number, field: keyof ApotekerPendamping, value: string) => {
    const updated = [...form.apotekerPendamping];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, apotekerPendamping: updated });
  };

  return (
    <div className="space-y-4">
      {/* Informasi Bisnis */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Informasi Bisnis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Apotek</Label>
              <Input value={form.namaApotek} onChange={(e) => setForm({ ...form, namaApotek: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <div className="flex gap-2">
                <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
                {form.logoUrl && (
                  <div className="w-10 h-10 rounded-lg border border-border overflow-hidden shrink-0">
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Alamat</Label>
              <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@apotek.com" />
            </div>
            <div className="space-y-1.5">
              <Label>No. WhatsApp / Telepon</Label>
              <Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} placeholder="08123456789" />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="www.apotek.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Persentase PPN (%)</Label>
              <Input type="number" value={form.ppnPercent} onChange={(e) => setForm({ ...form, ppnPercent: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground">PPN otomatis ditambahkan pada harga beli di form Barang Masuk.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Izin & APJ */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Izin & Apoteker Penanggung Jawab (APJ)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>No. SIA</Label>
              <Input value={form.noSIA} onChange={(e) => setForm({ ...form, noSIA: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nama APJ</Label>
              <Input value={form.namaAPJ} onChange={(e) => setForm({ ...form, namaAPJ: e.target.value })} placeholder="apt. Nama Lengkap, S.Farm" />
            </div>
            <div className="space-y-1.5">
              <Label>No. SIPA</Label>
              <Input value={form.noSIPA} onChange={(e) => setForm({ ...form, noSIPA: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>No. STRA</Label>
              <Input value={form.noSTRA} onChange={(e) => setForm({ ...form, noSTRA: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenaga Pendamping */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Tenaga Pendamping Kefarmasian
            </span>
            <Button variant="outline" size="sm" onClick={addPendamping} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Tambah Baris
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {form.apotekerPendamping.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada tenaga pendamping. Klik "Tambah Baris" untuk menambahkan.</p>
          ) : (
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Nama Apoteker Pendamping</TableHead>
                    <TableHead>No. SIPA</TableHead>
                    <TableHead className="w-14"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.apotekerPendamping.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <Input className="h-9" value={p.nama} onChange={(e) => updatePendamping(idx, 'nama', e.target.value)} placeholder="apt. Nama, S.Farm" />
                      </TableCell>
                      <TableCell>
                        <Input className="h-9" value={p.sipa} onChange={(e) => updatePendamping(idx, 'sipa', e.target.value)} placeholder="SIPA-xxx" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removePendamping(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Simpan Pengaturan Bisnis</Button>
      </div>
    </div>
  );
};

// ==================== TAB INVENTARIS ====================
const InventarisTab = () => {
  const { inventory, setInventory } = useSettingsStore();
  const [form, setForm] = useState(inventory);

  useEffect(() => { setForm(inventory); }, [inventory]);

  const handleSave = () => {
    setInventory(form);
    toast({ title: "Tersimpan", description: "Threshold inventaris berhasil diperbarui." });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Threshold Inventaris
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Batas Stok Kritis (unit)</Label>
            <Input type="number" value={form.stokKritis} onChange={(e) => setForm({ ...form, stokKritis: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground">Obat dengan stok ≤ nilai ini akan muncul di widget Dashboard "Stok Kritis".</p>
          </div>
          <div className="space-y-1.5">
            <Label>Reminder Kadaluwarsa (bulan)</Label>
            <Input type="number" value={form.reminderKadaluwarsa} onChange={(e) => setForm({ ...form, reminderKadaluwarsa: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground">Obat yang akan kadaluwarsa dalam X bulan ke depan ditampilkan di Dashboard.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Simpan Threshold</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== TAB MASTER DATA ====================
const MasterDataTab = () => {
  const { masterData, addUnit, removeUnit, addCategory, removeCategory } = useSettingsStore();
  const [newUnit, setNewUnit] = useState("");
  const [newCat, setNewCat] = useState("");

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Daftar Satuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {masterData.units.map((u) => (
              <Badge key={u.id} variant="secondary" className="gap-1 text-sm py-1 px-3">
                {u.name}
                <button onClick={() => removeUnit(u.id)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nama satuan baru..." value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="max-w-xs" />
            <Button variant="outline" size="sm" onClick={() => { if (newUnit.trim()) { addUnit(newUnit.trim()); setNewUnit(""); } }}>
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Daftar Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {masterData.categories.map((c) => (
              <Badge key={c.id} variant="secondary" className="gap-1 text-sm py-1 px-3">
                {c.name}
                <button onClick={() => removeCategory(c.id)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nama kategori baru..." value={newCat} onChange={(e) => setNewCat(e.target.value)} className="max-w-xs" />
            <Button variant="outline" size="sm" onClick={() => { if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); } }}>
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== TAB LOYALITAS ====================
const LoyalitasTab = () => {
  const { loyalty, setLoyalty } = useSettingsStore();
  const [form, setForm] = useState(loyalty);

  useEffect(() => { setForm(loyalty); }, [loyalty]);

  const handleSave = () => {
    setLoyalty(form);
    toast({ title: "Tersimpan", description: "Pengaturan loyalitas berhasil disimpan." });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> Program Loyalitas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>1 Poin = Rp</Label>
            <Input type="number" value={form.pointValue} onChange={(e) => setForm({ ...form, pointValue: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground">Setiap kelipatan {formatRupiah(form.pointValue)} belanja = 1 poin loyalitas.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Ambang Batas Tier Gold (Rp)</Label>
            <Input type="number" value={form.goldThreshold} onChange={(e) => setForm({ ...form, goldThreshold: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground">Pelanggan dengan total belanja ≥ {formatRupiah(form.goldThreshold)} naik ke Gold.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Simpan Loyalitas</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== TAB KASIR (STRUK) ====================
const KasirTab = () => {
  const { receipt, setReceipt } = useSettingsStore();
  const [form, setForm] = useState(receipt);

  useEffect(() => { setForm(receipt); }, [receipt]);

  const handleSave = () => {
    setReceipt(form);
    toast({ title: "Tersimpan", description: "Pengaturan struk kasir berhasil disimpan." });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" /> Pengaturan Struk Kasir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Hanya Apoteker / APJ yang dapat mengubah pengaturan ini.</p>
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Header Struk</h4>
            <div className="space-y-1.5">
              <Label>Baris 1 (kosongkan untuk nama apotek otomatis)</Label>
              <Input value={form.headerLine1} onChange={(e) => setForm({ ...form, headerLine1: e.target.value })} placeholder="Nama apotek — otomatis dari Pengaturan Bisnis" />
            </div>
            <div className="space-y-1.5">
              <Label>Baris 2 (Alamat)</Label>
              <Input value={form.headerLine2} onChange={(e) => setForm({ ...form, headerLine2: e.target.value })} placeholder="Alamat apotek" />
            </div>
            <div className="space-y-1.5">
              <Label>Baris 3 (Telepon/Info)</Label>
              <Input value={form.headerLine3} onChange={(e) => setForm({ ...form, headerLine3: e.target.value })} placeholder="Telp: 08xx" />
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Footer Struk</h4>
            <div className="space-y-1.5">
              <Label>Footer Baris 1</Label>
              <Input value={form.footerLine1} onChange={(e) => setForm({ ...form, footerLine1: e.target.value })} placeholder="Terima kasih atas kunjungan Anda" />
            </div>
            <div className="space-y-1.5">
              <Label>Footer Baris 2</Label>
              <Input value={form.footerLine2} onChange={(e) => setForm({ ...form, footerLine2: e.target.value })} placeholder="Semoga lekas sembuh!" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Simpan Pengaturan Struk</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== TAB KEAMANAN ====================
const KeamananTab = () => {
  const { roles, setRolePermissions } = useSettingsStore();

  const handleToggle = (role: RoleName, menu: string, checked: boolean) => {
    const current = roles.find((r) => r.role === role);
    if (!current) return;
    const newPerms = checked
      ? [...current.permissions, menu]
      : current.permissions.filter((p) => p !== menu);
    setRolePermissions(role, newPerms);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> Role-Based Access Control (RBAC)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Menu</th>
                {roles.map((r) => (
                  <th key={r.role} className="text-center p-3 font-medium text-muted-foreground">{r.role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMenus.map((menu) => (
                <tr key={menu.key} className="border-b last:border-0">
                  <td className="p-3 font-medium text-foreground">{menu.label}</td>
                  {roles.map((r) => (
                    <td key={r.role} className="text-center p-3">
                      {r.role === 'Apoteker' ? (
                        <Checkbox checked disabled className="opacity-60" />
                      ) : (
                        <Checkbox
                          checked={r.permissions.includes(menu.key)}
                          onCheckedChange={(checked) => handleToggle(r.role, menu.key, !!checked)}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Apoteker memiliki akses penuh dan tidak dapat diubah. Kasir secara default dibatasi dari menu Laporan dan Pengaturan.
        </p>
      </CardContent>
    </Card>
  );
};

// ==================== MAIN PAGE ====================
const SettingsPage = () => {
  const hasHydrated = useSettingsStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="p-6 animate-fade-in flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Pengaturan</h1>
      <p className="text-sm text-muted-foreground mb-6">Master Control Center — kelola variabel global yang berdampak pada seluruh modul aplikasi.</p>

      <Tabs defaultValue="bisnis" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="bisnis" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Bisnis</TabsTrigger>
          <TabsTrigger value="inventaris" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Inventaris</TabsTrigger>
          <TabsTrigger value="master-data" className="gap-1.5"><Database className="w-3.5 h-3.5" /> Master Data</TabsTrigger>
          <TabsTrigger value="loyalitas" className="gap-1.5"><Star className="w-3.5 h-3.5" /> Loyalitas</TabsTrigger>
          <TabsTrigger value="kasir" className="gap-1.5"><Receipt className="w-3.5 h-3.5" /> Kasir</TabsTrigger>
          <TabsTrigger value="keamanan" className="gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="bisnis"><BisnisTab /></TabsContent>
        <TabsContent value="inventaris"><InventarisTab /></TabsContent>
        <TabsContent value="master-data"><MasterDataTab /></TabsContent>
        <TabsContent value="loyalitas"><LoyalitasTab /></TabsContent>
        <TabsContent value="kasir"><KasirTab /></TabsContent>
        <TabsContent value="keamanan"><KeamananTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
