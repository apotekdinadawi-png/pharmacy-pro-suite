import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus, Search, Edit2, Trash2, Star, Gift, AlertTriangle,
  Heart, ShoppingBag, Crown, Phone, MapPin, Calendar, Pill,
  History, Award, Shield, ChevronRight, X,
} from "lucide-react";

type MemberTier = "Bronze" | "Silver" | "Gold" | "Platinum";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  birthDate: string;
  memberId: string;
  tier: MemberTier;
  points: number;
  totalSpent: number;
  totalVisits: number;
  allergies: string[];
  medicalNotes: string;
  joinDate: string;
  lastVisit: string;
}

interface PurchaseRecord {
  id: string;
  customerId: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  prescriptionDoctor?: string;
}

const tierConfig: Record<MemberTier, { min: number; color: string; discount: number; pointMultiplier: number }> = {
  Bronze: { min: 0, color: "bg-orange-500/10 text-orange-400 border-orange-500/20", discount: 0, pointMultiplier: 1 },
  Silver: { min: 500000, color: "bg-gray-400/10 text-gray-300 border-gray-400/20", discount: 3, pointMultiplier: 1.5 },
  Gold: { min: 2000000, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", discount: 5, pointMultiplier: 2 },
  Platinum: { min: 5000000, color: "bg-purple-500/10 text-purple-300 border-purple-500/20", discount: 10, pointMultiplier: 3 },
};

const initialCustomers: Customer[] = [
  {
    id: "C001", name: "Ani Suryani", phone: "0812-3456-7890", address: "Jl. Merdeka No. 10, Bandung",
    birthDate: "1985-03-15", memberId: "MBR-2023-001", tier: "Gold", points: 2450,
    totalSpent: 3250000, totalVisits: 28, allergies: ["Amoxicillin", "Sulfa"],
    medicalNotes: "Riwayat asma, hindari aspirin. Rutin kontrol hipertensi.", joinDate: "2023-01-10", lastVisit: "2024-01-14",
  },
  {
    id: "C002", name: "Budi Rahmat", phone: "0813-4567-8901", address: "Jl. Sudirman No. 25, Bandung",
    birthDate: "1978-07-22", memberId: "MBR-2023-002", tier: "Platinum", points: 5800,
    totalSpent: 7500000, totalVisits: 52, allergies: ["Penisilin"],
    medicalNotes: "Diabetes tipe 2, rutin metformin. Kontrol gula darah tiap bulan.", joinDate: "2023-02-05", lastVisit: "2024-01-15",
  },
  {
    id: "C003", name: "Citra Dewi", phone: "0814-5678-9012", address: "Jl. Asia Afrika No. 5, Bandung",
    birthDate: "1990-11-08", memberId: "MBR-2023-003", tier: "Silver", points: 780,
    totalSpent: 980000, totalVisits: 12, allergies: [],
    medicalNotes: "Ibu hamil trimester 3, perhatian khusus pada obat kategori X.", joinDate: "2023-06-20", lastVisit: "2024-01-10",
  },
  {
    id: "C004", name: "Dedi Kurniawan", phone: "0815-6789-0123", address: "Jl. Braga No. 18, Bandung",
    birthDate: "1965-01-30", memberId: "MBR-2023-004", tier: "Bronze", points: 120,
    totalSpent: 350000, totalVisits: 5, allergies: ["Ibuprofen", "Codein"],
    medicalNotes: "Lansia, riwayat gangguan ginjal. Perlu penyesuaian dosis.", joinDate: "2023-09-15", lastVisit: "2024-01-08",
  },
  {
    id: "C005", name: "Eka Pratiwi", phone: "0816-7890-1234", address: "Jl. Dago No. 77, Bandung",
    birthDate: "1995-05-20", memberId: "MBR-2024-001", tier: "Bronze", points: 50,
    totalSpent: 150000, totalVisits: 2, allergies: [],
    medicalNotes: "", joinDate: "2024-01-05", lastVisit: "2024-01-12",
  },
];

const purchaseHistory: PurchaseRecord[] = [
  {
    id: "PH001", customerId: "C001", date: "2024-01-14",
    items: [
      { name: "Amlodipine 5mg", qty: 30, price: 4500 },
      { name: "Candesartan 8mg", qty: 30, price: 8500 },
    ],
    total: 390000, pointsEarned: 78, pointsRedeemed: 0, prescriptionDoctor: "dr. Wijaya, Sp.PD",
  },
  {
    id: "PH002", customerId: "C001", date: "2024-01-02",
    items: [
      { name: "Salbutamol Inhaler", qty: 1, price: 45000 },
      { name: "Cetirizine 10mg", qty: 10, price: 2500 },
    ],
    total: 70000, pointsEarned: 14, pointsRedeemed: 0,
  },
  {
    id: "PH003", customerId: "C002", date: "2024-01-15",
    items: [
      { name: "Metformin 500mg", qty: 60, price: 3000 },
      { name: "Glimepiride 2mg", qty: 30, price: 5500 },
      { name: "Lancet Accu-Check", qty: 1, price: 85000 },
    ],
    total: 430000, pointsEarned: 129, pointsRedeemed: 200,
  },
  {
    id: "PH004", customerId: "C003", date: "2024-01-10",
    items: [
      { name: "Asam Folat 400mcg", qty: 30, price: 1500 },
      { name: "Kalsium Laktat 500mg", qty: 30, price: 2000 },
      { name: "Vitamin B Complex", qty: 30, price: 1800 },
    ],
    total: 159000, pointsEarned: 24, pointsRedeemed: 0, prescriptionDoctor: "dr. Sinta, Sp.OG",
  },
  {
    id: "PH005", customerId: "C002", date: "2023-12-20",
    items: [
      { name: "Metformin 500mg", qty: 60, price: 3000 },
      { name: "Simvastatin 20mg", qty: 30, price: 4000 },
    ],
    total: 300000, pointsEarned: 90, pointsRedeemed: 0, prescriptionDoctor: "dr. Wijaya, Sp.PD",
  },
];

const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCust, setEditCust] = useState<Customer | null>(null);
  const [detailCust, setDetailCust] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [redeemDialog, setRedeemDialog] = useState<Customer | null>(null);
  const [redeemAmount, setRedeemAmount] = useState("");

  // form state
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fBirth, setFBirth] = useState("");
  const [fAllergies, setFAllergies] = useState("");
  const [fMedNotes, setFMedNotes] = useState("");

  const resetForm = () => {
    setFName(""); setFPhone(""); setFAddress(""); setFBirth("");
    setFAllergies(""); setFMedNotes(""); setEditCust(null);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (c: Customer) => {
    setEditCust(c); setFName(c.name); setFPhone(c.phone); setFAddress(c.address);
    setFBirth(c.birthDate); setFAllergies(c.allergies.join(", ")); setFMedNotes(c.medicalNotes);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!fName || !fPhone) return;
    const allergiesArr = fAllergies.split(",").map(a => a.trim()).filter(Boolean);
    if (editCust) {
      setCustomers(prev => prev.map(c => c.id === editCust.id ? {
        ...c, name: fName, phone: fPhone, address: fAddress, birthDate: fBirth,
        allergies: allergiesArr, medicalNotes: fMedNotes,
      } : c));
    } else {
      const newC: Customer = {
        id: `C${String(customers.length + 1).padStart(3, "0")}`,
        name: fName, phone: fPhone, address: fAddress, birthDate: fBirth,
        memberId: `MBR-${new Date().getFullYear()}-${String(customers.length + 1).padStart(3, "0")}`,
        tier: "Bronze", points: 0, totalSpent: 0, totalVisits: 0,
        allergies: allergiesArr, medicalNotes: fMedNotes,
        joinDate: new Date().toISOString().slice(0, 10), lastVisit: "-",
      };
      setCustomers(prev => [...prev, newC]);
    }
    setDialogOpen(false); resetForm();
  };

  const handleRedeem = () => {
    if (!redeemDialog) return;
    const amt = parseInt(redeemAmount);
    if (!amt || amt <= 0 || amt > redeemDialog.points) return;
    setCustomers(prev => prev.map(c => c.id === redeemDialog.id
      ? { ...c, points: c.points - amt } : c));
    setRedeemDialog(null); setRedeemAmount("");
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const getTierForSpent = (spent: number): MemberTier => {
    if (spent >= tierConfig.Platinum.min) return "Platinum";
    if (spent >= tierConfig.Gold.min) return "Gold";
    if (spent >= tierConfig.Silver.min) return "Silver";
    return "Bronze";
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || c.memberId.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "all" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const custPurchases = (cid: string) => purchaseHistory.filter(p => p.customerId === cid);

  const stats = {
    total: customers.length,
    gold: customers.filter(c => c.tier === "Gold" || c.tier === "Platinum").length,
    totalPoints: customers.reduce((s, c) => s + c.points, 0),
    withAllergies: customers.filter(c => c.allergies.length > 0).length,
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pelanggan (CRM)</h1>
          <p className="text-sm text-muted-foreground">Membership, poin loyalitas, riwayat pembelian & peringatan alergi.</p>
        </div>
        <Button onClick={openAdd}><UserPlus className="w-4 h-4 mr-2" /> Tambah Pelanggan</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Member", value: stats.total, icon: <Heart className="w-5 h-5 text-primary" /> },
          { label: "Gold & Platinum", value: stats.gold, icon: <Crown className="w-5 h-5 text-yellow-400" /> },
          { label: "Total Poin Aktif", value: stats.totalPoints.toLocaleString("id-ID"), icon: <Star className="w-5 h-5 text-yellow-400" /> },
          { label: "Punya Alergi", value: stats.withAllergies, icon: <AlertTriangle className="w-5 h-5 text-destructive" /> },
        ].map(s => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier Info */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1"><Award className="w-4 h-4" /> PROGRAM MEMBERSHIP — Setiap Rp 5.000 = 1 Poin</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(tierConfig) as [MemberTier, typeof tierConfig.Bronze][]).map(([tier, cfg]) => (
              <div key={tier} className="rounded-lg border border-border p-3 text-center">
                <Badge className={cfg.color}>{tier}</Badge>
                <p className="text-xs text-muted-foreground mt-2">Min. belanja: {fmtRp(cfg.min)}</p>
                <p className="text-xs text-muted-foreground">Diskon: {cfg.discount}%</p>
                <p className="text-xs text-muted-foreground">Poin: x{cfg.pointMultiplier}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, telepon, atau ID member..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Semua Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tier</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Table */}
      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Poin</TableHead>
              <TableHead className="text-right">Total Belanja</TableHead>
              <TableHead>Alergi</TableHead>
              <TableHead>Kunjungan Terakhir</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => setDetailCust(c)}>
                <TableCell className="font-mono text-xs text-muted-foreground">{c.memberId}</TableCell>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell><Badge className={tierConfig[c.tier].color}>{c.tier}</Badge></TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  <span className="flex items-center justify-end gap-1"><Star className="w-3 h-3 text-yellow-400" />{c.points.toLocaleString("id-ID")}</span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{fmtRp(c.totalSpent)}</TableCell>
                <TableCell>
                  {c.allergies.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span className="text-xs text-destructive font-medium truncate max-w-[120px]">{c.allergies.join(", ")}</span>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.lastVisit}</TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setRedeemDialog(c)}><Gift className="w-4 h-4 text-primary" /></Button>
                    {deleteConfirm === c.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Ya</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(c.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Tidak ada pelanggan ditemukan.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={!!detailCust} onOpenChange={o => { if (!o) setDetailCust(null); }}>
        {detailCust && (
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" /> Profil Pelanggan
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{detailCust.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{detailCust.memberId}</p>
                </div>
                <Badge className={`${tierConfig[detailCust.tier].color} text-base px-3 py-1`}>
                  <Crown className="w-4 h-4 mr-1" />{detailCust.tier}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /> {detailCust.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {detailCust.address}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Lahir: {detailCust.birthDate}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Member sejak: {detailCust.joinDate}</div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{detailCust.points.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Poin Aktif</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{fmtRp(detailCust.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">Total Belanja</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{detailCust.totalVisits}x</p>
                  <p className="text-xs text-muted-foreground">Kunjungan</p>
                </div>
              </div>

              {/* Next Tier Progress */}
              {detailCust.tier !== "Platinum" && (() => {
                const tiers: MemberTier[] = ["Bronze", "Silver", "Gold", "Platinum"];
                const nextTier = tiers[tiers.indexOf(detailCust.tier) + 1];
                const needed = tierConfig[nextTier].min - detailCust.totalSpent;
                return (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Menuju <Badge className={tierConfig[nextTier].color}>{nextTier}</Badge></p>
                    <p className="text-sm text-foreground">Butuh belanja lagi <span className="font-bold text-primary">{fmtRp(Math.max(0, needed))}</span></p>
                  </div>
                );
              })()}

              {/* Allergy Warning */}
              {detailCust.allergies.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" /> PERINGATAN ALERGI
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detailCust.allergies.map(a => (
                      <Badge key={a} variant="destructive">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Notes */}
              {detailCust.medicalNotes && (
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-primary" /> Catatan Medis
                  </p>
                  <p className="text-sm text-muted-foreground">{detailCust.medicalNotes}</p>
                </div>
              )}

              {/* Purchase History */}
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-primary" /> Riwayat Pembelian
                </p>
                {custPurchases(detailCust.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada riwayat pembelian.</p>
                ) : (
                  <div className="space-y-3">
                    {custPurchases(detailCust.id).map(p => (
                      <div key={p.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{p.date}</span>
                            {p.prescriptionDoctor && (
                              <Badge variant="outline" className="text-xs">Resep: {p.prescriptionDoctor}</Badge>
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground">{fmtRp(p.total)}</span>
                        </div>
                        <div className="space-y-1">
                          {p.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                              <span>{it.name} x{it.qty}</span>
                              <span>{fmtRp(it.qty * it.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-2 pt-2 border-t border-border">
                          <span className="text-xs text-green-400">+{p.pointsEarned} poin</span>
                          {p.pointsRedeemed > 0 && <span className="text-xs text-orange-400">-{p.pointsRedeemed} poin ditukar</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCust ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Nama pelanggan" />
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="08xx-xxxx-xxxx" />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input value={fAddress} onChange={e => setFAddress(e.target.value)} placeholder="Alamat lengkap" />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input type="date" value={fBirth} onChange={e => setFBirth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Alergi Obat
              </Label>
              <Input value={fAllergies} onChange={e => setFAllergies(e.target.value)} placeholder="Pisahkan dengan koma: Amoxicillin, Sulfa" />
            </div>
            <div className="space-y-2">
              <Label>Catatan Medis</Label>
              <Textarea value={fMedNotes} onChange={e => setFMedNotes(e.target.value)} placeholder="Riwayat penyakit, kondisi khusus, dll." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleSave} disabled={!fName || !fPhone}>
              {editCust ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REDEEM POINTS DIALOG */}
      <Dialog open={!!redeemDialog} onOpenChange={o => { if (!o) { setRedeemDialog(null); setRedeemAmount(""); } }}>
        {redeemDialog && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Tukar Poin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{redeemDialog.name}</span> memiliki{" "}
                <span className="font-bold text-primary">{redeemDialog.points.toLocaleString("id-ID")}</span> poin.
              </p>
              <p className="text-xs text-muted-foreground">1 Poin = Rp 100 potongan harga</p>
              <div className="space-y-2">
                <Label>Jumlah Poin Ditukar</Label>
                <Input type="number" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)}
                  placeholder={`Maks. ${redeemDialog.points}`} max={redeemDialog.points} min={1} />
                {redeemAmount && parseInt(redeemAmount) > 0 && (
                  <p className="text-sm text-primary font-medium">
                    Potongan: {fmtRp(parseInt(redeemAmount) * 100)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRedeemDialog(null); setRedeemAmount(""); }}>Batal</Button>
              <Button onClick={handleRedeem} disabled={!redeemAmount || parseInt(redeemAmount) <= 0 || parseInt(redeemAmount) > redeemDialog.points}>
                Tukar Poin
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Customers;
