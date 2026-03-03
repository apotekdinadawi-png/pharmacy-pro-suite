import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Shield, Trash2, Clock, UserCheck, UserX,
  CheckCircle2, XCircle, Loader2, UserPlus, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AppRole } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  phone: string | null;
  sipa: string | null;
  status: string;
  created_at: string;
  role?: AppRole;
  email?: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  apj: 'APJ (Apoteker Penanggung Jawab)',
  aping: 'Aping (Apoteker Pendamping)',
  kasir: 'Kasir',
};

const roleBadgeStyle: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  apj: 'bg-primary/10 text-primary border-primary/20',
  aping: 'bg-accent/20 text-accent-foreground border-accent/30',
  kasir: 'bg-muted text-muted-foreground border-border',
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'approved': return <Badge className="bg-success/10 text-success border-success/20"><UserCheck className="w-3 h-3 mr-1" />Aktif</Badge>;
    case 'pending': return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'rejected': return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><UserX className="w-3 h-3 mr-1" />Ditolak</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const ADMIN_EMAIL = 'apotekdinadawi@gmail.com';

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleInfoOpen, setRoleInfoOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');

    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role as AppRole]));

    // Get emails from auth - we'll use user_id to match
    const enriched: UserProfile[] = (profiles || []).map(p => ({
      ...p,
      role: roleMap.get(p.user_id) || 'kasir',
    }));

    setUsers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'approved' }).eq('user_id', userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Disetujui", description: "User telah disetujui dan bisa login." });
    fetchUsers();
  };

  const handleReject = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('user_id', userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ditolak", description: "Pendaftaran user ditolak." });
    fetchUsers();
  };

  const handleDelete = async (user: UserProfile) => {
    setDeleting(true);
    // Delete role, profile — the auth user cleanup would need admin API
    // but we can at least remove from our tables
    await supabase.from('user_roles').delete().eq('user_id', user.user_id);
    const { error } = await supabase.from('profiles').delete().eq('user_id', user.user_id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dihapus", description: `Akun ${user.full_name} telah dihapus dari sistem.` });
    }
    setDeleteConfirm(null);
    setDeleting(false);
    fetchUsers();
  };

  const handleChangeRole = async (userId: string, newRole: AppRole) => {
    // Don't allow changing admin role
    const targetUser = users.find(u => u.user_id === userId);
    if (targetUser?.role === 'admin') return;

    // Check APJ limit
    if (newRole === 'apj') {
      const existingApj = users.find(u => u.role === 'apj' && u.user_id !== userId && u.status !== 'rejected');
      if (existingApj) {
        toast({ title: "Gagal", description: "Sudah ada akun APJ aktif. Hapus APJ lama terlebih dahulu.", variant: "destructive" });
        return;
      }
    }

    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
    if (error) {
      await supabase.from('user_roles').insert([{ user_id: userId, role: newRole }]);
    }
    toast({ title: "Role Diperbarui" });
    fetchUsers();
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const nonAdminUsers = users.filter(u => u.role !== 'admin');
  const filtered = nonAdminUsers.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: nonAdminUsers.length,
    aktif: nonAdminUsers.filter(u => u.status === 'approved').length,
    pending: pendingUsers.length,
    ditolak: nonAdminUsers.filter(u => u.status === 'rejected').length,
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
          <p className="text-sm text-muted-foreground">Kelola pendaftaran user, approve/reject, dan ubah role akses.</p>
        </div>
        <Button variant="outline" onClick={() => setRoleInfoOpen(true)}><Shield className="w-4 h-4 mr-2" /> Hak Akses</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total User", value: stats.total, icon: "👥" },
          { label: "User Aktif", value: stats.aktif, icon: "✅" },
          { label: "Pending", value: stats.pending, icon: "⏳" },
          { label: "Ditolak", value: stats.ditolak, icon: "❌" },
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

      {pendingUsers.length > 0 && (
        <Card className="glass-card border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <Clock className="w-4 h-4" /> Menunggu Persetujuan ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div>
                    <p className="font-medium text-foreground">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">@{u.username} — {roleLabels[u.role || 'kasir']}</p>
                    <p className="text-xs text-muted-foreground">Daftar: {new Date(u.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleApprove(u.user_id)}>
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(u.user_id)}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Table */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari nama atau username..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="approved">Aktif</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="glass-card">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
              <p className="text-sm">Memuat data user...</p>
            </div>
          ) : nonAdminUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada user terdaftar selain Admin.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>SIPA</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-foreground">{u.full_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">@{u.username || '—'}</TableCell>
                    <TableCell>
                      <Select value={u.role || 'kasir'} onValueChange={(v) => handleChangeRole(u.user_id, v as AppRole)}>
                        <SelectTrigger className="h-8 w-44">
                          <Badge className={roleBadgeStyle[u.role || 'kasir']}>{roleLabels[u.role || 'kasir']}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apj">APJ</SelectItem>
                          <SelectItem value="aping">Aping</SelectItem>
                          <SelectItem value="kasir">Kasir</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.sipa || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{u.phone || '—'}</TableCell>
                    <TableCell>{statusBadge(u.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {u.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleApprove(u.user_id)}>
                              <CheckCircle2 className="w-3 h-3" /> Acc
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => handleReject(u.user_id)}>
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {u.status === 'rejected' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleApprove(u.user_id)}>
                            <CheckCircle2 className="w-3 h-3" /> Aktifkan
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive gap-1" onClick={() => setDeleteConfirm(u)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada user ditemukan.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Hapus Akun User
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus akun <b className="text-foreground">{deleteConfirm?.full_name}</b> ({roleLabels[deleteConfirm?.role || 'kasir']})? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Info Dialog */}
      <Dialog open={roleInfoOpen} onOpenChange={setRoleInfoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Hak Akses per Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {[
              { role: 'Admin', perms: ['Akses penuh semua menu', 'Approve/reject pendaftaran user', 'Ubah role & hapus user', 'Hanya 1 akun (tidak bisa didaftarkan)'] },
              { role: 'APJ (Apoteker Penanggung Jawab)', perms: ['Dashboard, Transaksi, Inventaris, Pengadaan', 'Laporan, Pelanggan, Pengaturan', 'Maksimal 1 akun aktif'] },
              { role: 'Aping (Apoteker Pendamping)', perms: ['Dashboard', 'Inventaris', 'Pengadaan', 'Laporan'] },
              { role: 'Kasir', perms: ['Dashboard', 'Transaksi kasir (POS)', 'Pelanggan'] },
            ].map(r => (
              <Card key={r.role}>
                <CardHeader className="pb-2"><CardTitle className="text-sm"><Badge variant="outline">{r.role}</Badge></CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">{r.perms.map(p => <li key={p} className="text-xs text-muted-foreground flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{p}</li>)}</ul>
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
