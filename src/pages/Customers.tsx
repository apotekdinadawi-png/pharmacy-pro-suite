import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus, Search, Edit2, Trash2, Star, Gift, AlertTriangle,
  Heart, Crown, Phone, MapPin, Calendar, Pill,
  History, Award, ShoppingBag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCustomerStore, type Customer, type MemberTier } from "@/stores/useCustomerStore";
import { useCanEdit } from "@/hooks/useCanEdit";

const tierConfig: Record<MemberTier, { min: number; color: string; discount: number; pointMultiplier: number }> = {
  Bronze: { min: 0, color: "bg-orange-500/10 text-orange-400 border-orange-500/20", discount: 0, pointMultiplier: 1 },
  Silver: { min: 500000, color: "bg-gray-400/10 text-gray-300 border-gray-400/20", discount: 3, pointMultiplier: 1.5 },
  Gold: { min: 2000000, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", discount: 5, pointMultiplier: 2 },
  Platinum: { min: 5000000, color: "bg-purple-500/10 text-purple-300 border-purple-500/20", discount: 10, pointMultiplier: 3 },
};

const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const Customers = () => {
  const { customers, addCustomer, updateCustomer, removeCustomer, redeemPoints } = useCustomerStore();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCust, setEditCust] = useState<Customer | null>(null);
  const [detailCust, setDetailCust] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [redeemDialog, setRedeemDialog] = useState<Customer | null>(null);
  const [redeemAmount, setRedeemAmount] = useState("");

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
    if (!fName || !fPhone) { toast({ title: "Error", description: "Nama dan telepon wajib diisi.", variant: "destructive" }); return; }
    const allergiesArr = fAllergies.split(",").map(a => a.trim()).filter(Boolean);
    if (editCust) {
      updateCustomer(editCust.id, {
        name: fName, phone: fPhone, address: fAddress, birthDate: fBirth,
        allergies: allergiesArr, medicalNotes: fMedNotes,
      });
      toast({ title: "Diperbarui", description: `Data ${fName} berhasil disimpan.` });
    } else {
      addCustomer({
        name: fName, phone: fPhone, address: fAddress, birthDate: fBirth,
        allergies: allergiesArr, medicalNotes: fMedNotes,
      });
      toast({ title: "Berhasil", description: `${fName} ditambahkan sebagai pelanggan.` });
    }
    setDialogOpen(false); resetForm();
  };

  const handleRedeem = () => {
    if (!redeemDialog) return;
    const amt = parseInt(redeemAmount);
    if (!amt || amt <= 0 || amt > redeemDialog.points) return;
    redeemPoints(redeemDialog.id, amt);
    toast({ title: "Poin Ditukar", description: `${amt} poin berhasil ditukar.` });
    setRedeemDialog(null); setRedeemAmount("");
  };

  const handleDelete = (id: string) => {
    removeCustomer(id);
    toast({ title: "Dihapus", description: "Pelanggan berhasil dihapus." });
    setDeleteConfirm(null);
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || c.memberId.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "all" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

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
          <p className="text-sm text-muted-foreground">Membership, poin loyalitas, & peringatan alergi. Data tersimpan permanen.</p>
        </div>
        <Button onClick={openAdd}><UserPlus className="w-4 h-4 mr-2" /> Tambah Pelanggan</Button>
      </div>

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

      <Card className="glass-card">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1"><Award className="w-4 h-4" /> PROGRAM MEMBERSHIP — Setiap Rp 5.000 = 1 Poin</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(tierConfig) as [MemberTier, typeof tierConfig.Bronze][]).map(([tier, cfg]) => (
              <div key={tier} className="rounded-lg border border-border p-3 text-center">
                <Badge className={cfg.color}>{tier}</Badge>
                <p className="text-xs text-muted-foreground mt-2">Min. belanja: {fmtRp(cfg.min)}</p>
                <p className="text-xs text-muted-foreground">Diskon: {cfg.discount}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, telepon, atau ID member..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card className="glass-card">
        {customers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada pelanggan. Klik "Tambah Pelanggan" untuk memulai.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Alergi</TableHead>
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
                  <TableCell>
                    {c.allergies.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <span className="text-xs text-destructive font-medium truncate max-w-[120px]">{c.allergies.join(", ")}</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">-</span>}
                  </TableCell>
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
              {filtered.length === 0 && customers.length > 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada pelanggan ditemukan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailCust} onOpenChange={o => { if (!o) setDetailCust(null); }}>
        {detailCust && (
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Profil Pelanggan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {detailCust.address || '-'}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Lahir: {detailCust.birthDate || '-'}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Member sejak: {detailCust.joinDate}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{detailCust.points.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground"><Star className="w-3 h-3 inline text-yellow-400" /> Poin</p>
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
              {detailCust.allergies.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> PERINGATAN ALERGI</p>
                  <div className="flex flex-wrap gap-2">
                    {detailCust.allergies.map(a => <Badge key={a} variant="destructive">{a}</Badge>)}
                  </div>
                </div>
              )}
              {detailCust.medicalNotes && (
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"><Pill className="w-4 h-4 text-primary" /> Catatan Medis</p>
                  <p className="text-sm text-muted-foreground">{detailCust.medicalNotes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCust ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nama Lengkap *</Label><Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Nama pelanggan" /></div>
            <div className="space-y-2"><Label>No. Telepon *</Label><Input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="08xx-xxxx-xxxx" /></div>
            <div className="space-y-2"><Label>Alamat</Label><Input value={fAddress} onChange={e => setFAddress(e.target.value)} placeholder="Alamat lengkap" /></div>
            <div className="space-y-2"><Label>Tanggal Lahir</Label><Input type="date" value={fBirth} onChange={e => setFBirth(e.target.value)} /></div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Alergi Obat</Label>
              <Input value={fAllergies} onChange={e => setFAllergies(e.target.value)} placeholder="Pisahkan dengan koma" />
            </div>
            <div className="space-y-2"><Label>Catatan Medis</Label><Textarea value={fMedNotes} onChange={e => setFMedNotes(e.target.value)} placeholder="Riwayat penyakit, kondisi khusus..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleSave} disabled={!fName || !fPhone}>{editCust ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Points Dialog */}
      <Dialog open={!!redeemDialog} onOpenChange={o => { if (!o) { setRedeemDialog(null); setRedeemAmount(""); } }}>
        {redeemDialog && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Tukar Poin</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{redeemDialog.name}</span> memiliki{" "}
                <span className="font-bold text-primary">{redeemDialog.points.toLocaleString("id-ID")}</span> poin.
              </p>
              <div className="space-y-2">
                <Label>Jumlah Poin Ditukar</Label>
                <Input type="number" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)} placeholder={`Maks. ${redeemDialog.points}`} />
                {redeemAmount && parseInt(redeemAmount) > 0 && (
                  <p className="text-sm text-primary font-medium">Potongan: {fmtRp(parseInt(redeemAmount) * 100)}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRedeemDialog(null); setRedeemAmount(""); }}>Batal</Button>
              <Button onClick={handleRedeem} disabled={!redeemAmount || parseInt(redeemAmount) <= 0 || parseInt(redeemAmount) > redeemDialog.points}>Tukar Poin</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Customers;
