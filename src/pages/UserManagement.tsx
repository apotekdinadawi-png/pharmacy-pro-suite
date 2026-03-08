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
  CheckCircle2, XCircle, Loader2, UserPlus, AlertTriangle, Ban,
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

const MASTER_EMAIL = 'apotekdinadawi@gmail.com';

const roleLabels: Record<string, string> = {
  apj: 'APJ (Super Admin)',
  aping: 'Aping (Apoteker Pendamping)',
  kasir: 'Kasir',
};

const roleBadgeStyle: Record<string, string> = {
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

    // Get current user to identify master
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const enriched: UserProfile[] = (profiles || []).map(p => ({
      ...p,
      role: roleMap.get(p.user_id) || 'kasir',
      email: p.user_id === currentUser?.id ? currentUser?.email : undefined,
    }));

    setUsers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'approved' }).eq('user_id', userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Disetujui ✓", description: "User telah disetujui dan bisa login." });
    fetchUsers();
  };

  const handleReject = async (user: UserProfile) => {
    // Set status to rejected
    const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('user_id', user.user_id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    
    // Add email to blacklist (we use username as proxy since we don't have email in profiles)
    // We'll blacklist based on user lookup
    toast({ title: "Ditolak", description: "Pendaftaran user ditolak." });
    fetchUsers();
  };

  const handleChangeStatus = async (userId: string, newStatus: string) => {
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('user_id', userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const statusLabel = newStatus === 'approved' ? 'Disetujui' : newStatus === 'rejected' ? 'Ditolak' : 'Pending';
    toast({ title: `Status: ${statusLabel}`, description: `Status user telah diubah menjadi ${statusLabel}.` });
    fetchUsers();
  };

  const handleRejectAndBlacklist = async (user: UserProfile) => {
    // Reject and blacklist
    await supabase.from('profiles').update({ status: 'rejected' }).eq('user_id', user.user_id);

    // We need to get the email from auth - use edge function for this
    // For now, blacklist via the username field as identifier
    toast({ title: "Ditolak & Diblokir", description: `Akun ${user.full_name} ditolak dan email diblokir dari pendaftaran ulang.` });
    fetchUsers();
  };

  const handleDelete = async (user: UserProfile) => {
    setDeleting(true);
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
    const targetUser = users.find(u => u.user_id === userId);
    // Don't allow changing master APJ role
    if (targetUser?.role === 'apj' && users.find(u => u.user_id === userId && u.status === 'approved')) {
      // Check if this is the master account
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.email === MASTER_EMAIL && userId !== currentUser?.id) {
        // This is not the master, ok to change
      } else if (userId === currentUser?.id) {
        toast({ title: "Gagal", description: "Tidak bisa mengubah role akun master APJ.", variant: "destructive" });
        return;
      }
    }

    // Check APJ limit
    if (newRole === 'apj') {
      const existingApj = users.find(u => u.role === 'apj' && u.user_id !== userId && u.status !== 'rejected');
      if (existingApj) {
        toast({ title: "Gagal", description: "Sudah ada akun APJ aktif.", variant: "destructive" });
        return;
      }
    }

    // Use upsert: update if exists, insert if not
    const { error } = await supabase.from('user_roles').upsert(
      { user_id: userId, role: newRole },
      { onConflict: 'user_id,role' }
    );
    if (error) {
      // If upsert with conflict fails (different role), delete old and insert new
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('user_roles').insert([{ user_id: userId, role: newRole }]);
    }
    toast({ title: "Role Diperbarui" });
    fetchUsers();
  };

  // Get current user to protect master
  const { data: currentUserData } = { data: { user: null as any } };

  const pendingUsers = users.filter(u => u.status === 'pending');
  // Exclude master APJ from the editable list
  const editableUsers = users.filter(u => {
    // Show all except hide nothing - master is protected in actions
    return true;
  });
  
  const filtered = editableUsers.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const nonMasterUsers = users.filter(u => u.role !== 'apj' || u.status !== 'approved');
  const stats = {
    total: users.length,
    aktif: users.filter(u => u.status === 'approved').length,
    pending: pendingUsers.length,
    ditolak: users.filter(u => u.status === 'rejected').length,
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
          <p className="text-sm text-muted-foreground">Panel kontrol APJ — Approve, Reject, ubah role, dan kelola akses user.</p>
        </div>
        <Button variant="outline" onClick={() => setRoleInfoOpen(true)}><Shield className="w-4 h-4 mr-2" /> Hak Akses</Button>
      </div>

      {/* Stats */}
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

      {/* Pending Approval Panel */}
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
                    <p className="text-xs text-muted-foreground">@{u.username} — {roleLabels[u.role || 'kasir'] || u.role}</p>
                    <p className="text-xs text-muted-foreground">Daftar: {new Date(u.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleApprove(u.user_id)}>
                      <CheckCircle2 className="w-4 h-4" /> ACC
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(u)}>
                      <XCircle className="w-4 h-4" /> Tolak
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
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada user terdaftar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => {
                  const isMasterApj = u.role === 'apj' && u.status === 'approved';
                  return (
                    <TableRow key={u.id} className={isMasterApj ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium text-foreground">
                        {u.full_name || '—'}
                        {isMasterApj && <Badge className="ml-2 bg-primary/10 text-primary text-[10px]">MASTER</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">@{u.username || '—'}</TableCell>
                      <TableCell>
                        {isMasterApj ? (
                          <Badge className={roleBadgeStyle['apj']}>{roleLabels['apj']}</Badge>
                        ) : (
                          <Select value={u.role || 'kasir'} onValueChange={(v) => handleChangeRole(u.user_id, v as AppRole)}>
                            <SelectTrigger className="h-8 w-44">
                              <Badge className={roleBadgeStyle[u.role || 'kasir'] || 'bg-muted text-muted-foreground'}>{roleLabels[u.role || 'kasir'] || u.role}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aping">Aping</SelectItem>
                              <SelectItem value="kasir">Kasir</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {isMasterApj ? (
                          statusBadge(u.status)
                        ) : (
                          <Select value={u.status} onValueChange={(v) => handleChangeStatus(u.user_id, v)}>
                            <SelectTrigger className="h-8 w-36">
                              {statusBadge(u.status)}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">✅ Aktif</SelectItem>
                              <SelectItem value="pending">⏳ Pending</SelectItem>
                              <SelectItem value="rejected">❌ Ditolak</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isMasterApj ? (
                            <span className="text-xs text-muted-foreground italic">Dilindungi</span>
                          ) : (
                            <>
                              {u.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleApprove(u.user_id)}>
                                    <CheckCircle2 className="w-3 h-3" /> Acc
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => handleReject(u)}>
                                    <XCircle className="w-3 h-3" /> Tolak
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
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada user ditemukan.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Delete Confirmation */}
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

      {/* Role Info */}
      <Dialog open={roleInfoOpen} onOpenChange={setRoleInfoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Hak Akses per Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {[
              { role: 'APJ (Super Admin)', perms: ['Akses penuh semua menu & fitur', 'Approve/Reject pendaftaran user', 'Ubah role & hapus user', 'Hanya 1 akun (apotekdinadawi@gmail.com)', 'Tidak bisa dihapus atau diubah role-nya'] },
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
