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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  UserPlus, Search, Shield, Edit2, Trash2, Clock, UserCheck, UserX,
  LogIn, LogOut, FileText, Package, ShoppingCart, AlertTriangle,
} from "lucide-react";

type UserRole = "Apoteker" | "Asisten Apoteker" | "Kasir";
type UserStatus = "Aktif" | "Nonaktif";

interface StaffUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  sipa?: string;
  phone: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: "auth" | "transaksi" | "inventaris" | "pengadaan" | "sistem";
  detail: string;
  timestamp: string;
  ip: string;
}

const initialUsers: StaffUser[] = [
  { id: "U001", name: "Apt. Sari Dewi, S.Farm", username: "sari.apt", role: "Apoteker", sipa: "SIPA-2024-001234", phone: "0812-3456-7890", status: "Aktif", lastLogin: "2024-01-15 08:30", createdAt: "2023-06-01" },
  { id: "U002", name: "Rina Handayani", username: "rina.aa", role: "Asisten Apoteker", phone: "0813-4567-8901", status: "Aktif", lastLogin: "2024-01-15 07:45", createdAt: "2023-08-15" },
  { id: "U003", name: "Budi Santoso", username: "budi.kasir", role: "Kasir", phone: "0814-5678-9012", status: "Aktif", lastLogin: "2024-01-14 16:00", createdAt: "2023-09-01" },
  { id: "U004", name: "Dewi Lestari", username: "dewi.kasir", role: "Kasir", phone: "0815-6789-0123", status: "Nonaktif", lastLogin: "2024-01-10 12:00", createdAt: "2023-10-01" },
  { id: "U005", name: "Apt. Ahmad Fauzi, S.Farm", username: "ahmad.apt", role: "Apoteker", sipa: "SIPA-2024-005678", phone: "0816-7890-1234", status: "Aktif", lastLogin: "2024-01-15 09:00", createdAt: "2023-07-01" },
];

const initialLogs: ActivityLog[] = [
  { id: "L001", userId: "U001", userName: "Apt. Sari Dewi", userRole: "Apoteker", action: "Login", category: "auth", detail: "Login berhasil dari perangkat utama", timestamp: "2024-01-15 08:30:12", ip: "192.168.1.10" },
  { id: "L002", userId: "U003", userName: "Budi Santoso", userRole: "Kasir", action: "Transaksi Baru", category: "transaksi", detail: "Transaksi #TRX-20240115-001 - Total Rp 245.000", timestamp: "2024-01-15 09:15:33", ip: "192.168.1.12" },
  { id: "L003", userId: "U002", userName: "Rina Handayani", userRole: "Asisten Apoteker", action: "Update Stok", category: "inventaris", detail: "Paracetamol 500mg: stok +100 (penerimaan dari PBF Kimia Farma)", timestamp: "2024-01-15 10:05:44", ip: "192.168.1.11" },
  { id: "L004", userId: "U001", userName: "Apt. Sari Dewi", userRole: "Apoteker", action: "Cetak SP Narkotika", category: "pengadaan", detail: "SP Narkotika #SP-N-20240115-001 untuk Codein 10mg", timestamp: "2024-01-15 10:30:00", ip: "192.168.1.10" },
  { id: "L005", userId: "U005", userName: "Apt. Ahmad Fauzi", userRole: "Apoteker", action: "Validasi Resep", category: "transaksi", detail: "Resep dr. Wijaya - Pasien Ani Suryani - 3 item obat keras", timestamp: "2024-01-15 11:00:15", ip: "192.168.1.10" },
  { id: "L006", userId: "U003", userName: "Budi Santoso", userRole: "Kasir", action: "Void Transaksi", category: "transaksi", detail: "Void TRX-20240115-003 - Alasan: salah input qty", timestamp: "2024-01-15 11:30:20", ip: "192.168.1.12" },
  { id: "L007", userId: "U001", userName: "Apt. Sari Dewi", userRole: "Apoteker", action: "Ubah Harga Jual", category: "inventaris", detail: "Amoxicillin 500mg: Rp 3.500 → Rp 4.000", timestamp: "2024-01-15 13:00:00", ip: "192.168.1.10" },
  { id: "L008", userId: "U004", userName: "Dewi Lestari", userRole: "Kasir", action: "Login Gagal", category: "auth", detail: "Akun nonaktif - percobaan login ditolak", timestamp: "2024-01-15 14:00:00", ip: "192.168.1.20" },
  { id: "L009", userId: "U001", userName: "Apt. Sari Dewi", userRole: "Apoteker", action: "Nonaktifkan User", category: "sistem", detail: "User Dewi Lestari (U004) dinonaktifkan - alasan: resign", timestamp: "2024-01-12 16:00:00", ip: "192.168.1.10" },
  { id: "L010", userId: "U002", userName: "Rina Handayani", userRole: "Asisten Apoteker", action: "Logout", category: "auth", detail: "Logout normal - shift selesai", timestamp: "2024-01-15 15:00:00", ip: "192.168.1.11" },
];

const rolePermissions: Record<UserRole, string[]> = {
  Apoteker: [
    "Akses semua fitur",
    "Validasi & input resep dokter",
    "Cetak SP Narkotika/Psikotropika",
    "Manajemen user & role",
    "Lihat laporan laba rugi",
    "Ubah harga jual & stok",
    "Void/hapus transaksi",
  ],
  "Asisten Apoteker": [
    "Transaksi kasir",
    "Input & racik resep (perlu validasi Apoteker)",
    "Update stok penerimaan",
    "Lihat laporan (kecuali laba rugi)",
    "Cetak SP reguler",
  ],
  Kasir: [
    "Transaksi kasir (OTC only)",
    "Cetak struk & etiket",
    "Lihat stok (read-only)",
    "Lihat riwayat transaksi sendiri",
  ],
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
  const [users, setUsers] = useState<StaffUser[]>(initialUsers);
  const [logs] = useState<ActivityLog[]>(initialLogs);
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

  const resetForm = () => {
    setFormName(""); setFormUsername(""); setFormRole("Kasir");
    setFormSipa(""); setFormPhone(""); setFormStatus("Aktif");
    setEditUser(null);
  };

  const openAddDialog = () => { resetForm(); setDialogOpen(true); };

  const openEditDialog = (u: StaffUser) => {
    setEditUser(u);
    setFormName(u.name); setFormUsername(u.username); setFormRole(u.role);
    setFormSipa(u.sipa || ""); setFormPhone(u.phone); setFormStatus(u.status);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formUsername) return;
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? {
        ...u, name: formName, username: formUsername, role: formRole,
        sipa: formRole === "Apoteker" ? formSipa : undefined,
        phone: formPhone, status: formStatus,
      } : u));
    } else {
      const newUser: StaffUser = {
        id: `U${String(users.length + 1).padStart(3, "0")}`,
        name: formName, username: formUsername, role: formRole,
        sipa: formRole === "Apoteker" ? formSipa : undefined,
        phone: formPhone, status: formStatus,
        lastLogin: "-", createdAt: new Date().toISOString().slice(0, 10),
      };
      setUsers(prev => [...prev, newUser]);
    }
    setDialogOpen(false); resetForm();
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === "Aktif" ? "Nonaktif" : "Aktif" }
      : u));
  };

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
          <p className="text-sm text-muted-foreground">Kelola pengguna, role akses, dan pantau aktivitas sistem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRoleInfoOpen(true)}>
            <Shield className="w-4 h-4 mr-2" /> Hak Akses
          </Button>
          <Button onClick={openAddDialog}>
            <UserPlus className="w-4 h-4 mr-2" /> Tambah User
          </Button>
        </div>
      </div>

      {/* Stats */}
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

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama, username, atau role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          <Card className="glass-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>No. SIPA</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.id}</TableCell>
                    <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.username}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(u.role)}>{u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.sipa || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "Aktif" ? "default" : "destructive"} className="cursor-pointer" onClick={() => toggleStatus(u.id)}>
                        {u.status === "Aktif" ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEditDialog(u)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {deleteConfirm === u.id ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>Ya</Button>
                            <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(u.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Tidak ada user ditemukan.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari aktivitas..." value={logSearch} onChange={e => setLogSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={logCategoryFilter} onValueChange={setLogCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Waktu</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {l.timestamp}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{l.userName}</TableCell>
                    <TableCell><Badge className={getRoleBadge(l.userRole)} variant="outline">{l.userRole}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(l.category)}>
                        <span className="mr-1">{getCategoryIcon(l.category)}</span>
                        {l.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{l.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{l.detail}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{l.ip}</TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada log ditemukan.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ADD/EDIT USER DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Tambah User Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nama lengkap + gelar" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="username.login" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={v => setFormRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apoteker">Apoteker</SelectItem>
                  <SelectItem value="Asisten Apoteker">Asisten Apoteker</SelectItem>
                  <SelectItem value="Kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formRole === "Apoteker" && (
              <div className="space-y-2">
                <Label>No. SIPA</Label>
                <Input value={formSipa} onChange={e => setFormSipa(e.target.value)} placeholder="SIPA-YYYY-XXXXXX" />
              </div>
            )}
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="08xx-xxxx-xxxx" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={v => setFormStatus(v as UserStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleSave} disabled={!formName || !formUsername}>
              {editUser ? "Simpan Perubahan" : "Tambah User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROLE PERMISSIONS DIALOG */}
      <Dialog open={roleInfoOpen} onOpenChange={setRoleInfoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Hak Akses per Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {(Object.entries(rolePermissions) as [UserRole, string[]][]).map(([role, perms]) => (
              <div key={role}>
                <Badge className={`${getRoleBadge(role)} mb-2`}>{role}</Badge>
                <ul className="space-y-1 ml-2">
                  {perms.map((p, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
