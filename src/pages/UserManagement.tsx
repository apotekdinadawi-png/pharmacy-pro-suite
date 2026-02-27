import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  UserPlus, Search, Shield, Edit2, Trash2, Clock, UserCheck, UserX,
  LogIn, Package, ShoppingCart, AlertTriangle, FileText,
} from "lucide-react";
import { useUserStore, type StaffUser, type UserRole, type UserStatus, type ActivityLog } from "@/stores/useUserStore";

const rolePermissions: Record<UserRole, string[]> = {
  Apoteker: ["Akses semua fitur", "Validasi & input resep dokter", "Cetak SP Narkotika/Psikotropika", "Manajemen user & role", "Lihat laporan laba rugi", "Ubah harga jual & stok", "Void/hapus transaksi"],
  "Asisten Apoteker": ["Transaksi kasir", "Input & racik resep (perlu validasi Apoteker)", "Update stok penerimaan", "Lihat laporan (kecuali laba rugi)", "Cetak SP reguler"],
  Kasir: ["Transaksi kasir (OTC only)", "Cetak struk & etiket", "Lihat stok (read-only)", "Lihat riwayat transaksi sendiri"],
};

const getCategoryIcon = (cat: ActivityLog["category"]) => {
  switch (cat) {
    case "auth": return <LogIn className="w-4 h-4" />;
    case "transaksi": return <ShoppingCart className="w-4 h-4" />;
    case "inventaris": return <Package className="w-4 h-4" />;
    case "pengadaan": return <FileText className="w-4 h-4" />;
    case "sistem": return <AlertTriangle className="w-4 h-4" />;
  }
};

const getCategoryColor = (cat: ActivityLog["category"]) => {
  switch (cat) {
    case "auth": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "transaksi": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "inventaris": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "pengadaan": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "sistem": return "bg-red-500/10 text-red-400 border-red-500/20";
  }
};

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "Apoteker": return "bg-primary/10 text-primary border-primary/20";
    case "Asisten Apoteker": return "bg-accent/20 text-accent-foreground border-accent/30";
    case "Kasir": return "bg-muted text-muted-foreground border-border";
  }
};

const UserManagement = () => {
  const { users, logs, addUser, updateUser, removeUser, toggleStatus } = useUserStore();
  const [search, setSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [roleInfoOpen, setRoleInfoOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("Kasir");
  const [formSipa, setFormSipa] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<UserStatus>("Aktif");

  const resetForm = () => { setFormName(""); setFormUsername(""); setFormRole("Kasir"); setFormSipa(""); setFormPhone(""); setFormStatus("Aktif"); setEditUser(null); };
  const openAddDialog = () => { resetForm(); setDialogOpen(true); };
  const openEditDialog = (u: StaffUser) => {
    setEditUser(u); setFormName(u.name); setFormUsername(u.username); setFormRole(u.role);
    setFormSipa(u.sipa || ""); setFormPhone(u.phone); setFormStatus(u.status); setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formUsername) return;
    if (editUser) {
      updateUser(editUser.id, {
        name: formName, username: formUsername, role: formRole,
        sipa: formRole === "Apoteker" ? formSipa : undefined,
        phone: formPhone, status: formStatus,
      });
    } else {
      addUser({
        name: formName, username: formUsername, role: formRole,
        sipa: formRole === "Apoteker" ? formSipa : undefined,
        phone: formPhone, status: formStatus,
        lastLogin: "-", createdAt: new Date().toISOString().slice(0, 10),
      });
    }
    setDialogOpen(false); resetForm();
  };

  const handleDelete = (id: string) => { removeUser(id); setDeleteConfirm(null); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogs = logs.filter(l => {
    const matchSearch = l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.detail.toLowerCase().includes(logSearch.toLowerCase());
    const matchCat = logCategoryFilter === "all" || l.category === logCategoryFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total: users.length,
    aktif: users.filter(u => u.status === "Aktif").length,
    apoteker: users.filter(u => u.role === "Apoteker").length,
    kasir: users.filter(u => u.role === "Kasir").length,
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
          <p className="text-sm text-muted-foreground">Kelola pengguna, role akses, dan pantau aktivitas sistem. Data tersimpan permanen.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRoleInfoOpen(true)}><Shield className="w-4 h-4 mr-2" /> Hak Akses</Button>
          <Button onClick={openAddDialog}><UserPlus className="w-4 h-4 mr-2" /> Tambah User</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total User", value: stats.total, icon: "👥" },
          { label: "User Aktif", value: stats.aktif, icon: "✅" },
          { label: "Apoteker", value: stats.apoteker, icon: "💊" },
          { label: "Kasir", value: stats.kasir, icon: "🧾" },
        ].map(s => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Daftar User</TabsTrigger>
          <TabsTrigger value="logs">Log Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama, username, atau role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          <Card className="glass-card">
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada user. Klik "Tambah User" untuk menambahkan.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>No. SIPA</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.username}</TableCell>
                      <TableCell><Badge className={getRoleBadge(u.role)}>{u.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.sipa || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === "Aktif" ? "default" : "destructive"} className="cursor-pointer" onClick={() => toggleStatus(u.id)}>
                          {u.status === "Aktif" ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(u)}><Edit2 className="w-4 h-4" /></Button>
                          {deleteConfirm === u.id ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>Ya</Button>
                              <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
                            </div>
                          ) : (
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(u.id)}><Trash2 className="w-4 h-4" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && users.length > 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada user ditemukan.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari aktivitas..." value={logSearch} onChange={e => setLogSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={logCategoryFilter} onValueChange={setLogCategoryFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="auth">Autentikasi</SelectItem>
                <SelectItem value="transaksi">Transaksi</SelectItem>
                <SelectItem value="inventaris">Inventaris</SelectItem>
                <SelectItem value="pengadaan">Pengadaan</SelectItem>
                <SelectItem value="sistem">Sistem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-card">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada log aktivitas.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Waktu</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {l.timestamp}</div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{l.userName}</TableCell>
                      <TableCell><Badge className={getRoleBadge(l.userRole)} variant="outline">{l.userRole}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(l.category)}>
                          <span className="mr-1">{getCategoryIcon(l.category)}</span>
                          {l.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{l.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{l.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editUser ? "Edit User" : "Tambah User Baru"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2"><Label>Nama Lengkap *</Label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Username *</Label><Input value={formUsername} onChange={e => setFormUsername(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apoteker">Apoteker</SelectItem>
                  <SelectItem value="Asisten Apoteker">Asisten Apoteker</SelectItem>
                  <SelectItem value="Kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formRole === "Apoteker" && (
              <div className="space-y-1.5 col-span-2"><Label>No. SIPA</Label><Input value={formSipa} onChange={e => setFormSipa(e.target.value)} /></div>
            )}
            <div className="space-y-1.5"><Label>No. Telepon</Label><Input value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as UserStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Info Dialog */}
      <Dialog open={roleInfoOpen} onOpenChange={setRoleInfoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Hak Akses per Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {(Object.entries(rolePermissions) as [UserRole, string[]][]).map(([role, perms]) => (
              <Card key={role}>
                <CardHeader className="pb-2"><CardTitle className="text-sm"><Badge className={getRoleBadge(role)}>{role}</Badge></CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">{perms.map(p => <li key={p} className="text-xs text-muted-foreground flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{p}</li>)}</ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
