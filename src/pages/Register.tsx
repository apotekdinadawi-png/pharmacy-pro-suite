import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Pill, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apjTaken, setApjTaken] = useState(false);

  useEffect(() => {
    // Check if APJ role is already taken (approved or pending)
    const checkApj = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'apj');
      
      if (data && data.length > 0) {
        // Check if any of these users are approved or pending
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, status')
          .in('user_id', data.map(r => r.user_id))
          .in('status', ['approved', 'pending']);
        
        setApjTaken((profiles?.length || 0) > 0);
      }
    };
    checkApj();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !username || !email || !password || !role) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (!email.includes("@")) {
      setError("Format email tidak valid.");
      return;
    }
    if (email.toLowerCase() === 'apotekdinadawi@gmail.com') {
      setError("Email ini tidak dapat digunakan untuk pendaftaran.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const { error: err } = await signUp(email, password, { full_name: fullName, username, role });
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full gradient-primary opacity-10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full gradient-accent opacity-10 blur-3xl" />
        </div>
        <div className="w-full max-w-md px-4 animate-fade-in">
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Pendaftaran Berhasil!</h2>
              <p className="text-sm text-muted-foreground">
                Akun Anda telah didaftarkan dengan status <b className="text-warning">Pending</b>.
                Silakan tunggu persetujuan dari Admin untuk dapat login ke sistem.
              </p>
              <Button onClick={() => navigate("/")} className="w-full gradient-primary text-primary-foreground">
                Kembali ke Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full gradient-primary opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full gradient-accent opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md px-4 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-lg mb-4">
            <Pill className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Daftar Akun</h1>
          <p className="text-muted-foreground mt-1">Registrasi sebagai APJ, Aping, atau Kasir</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap Anda" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username untuk login" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regEmail">Email *</Label>
                <Input id="regEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regPassword">Password *</Label>
                <div className="relative">
                  <Input
                    id="regPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role / Jabatan *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Pilih role Anda" /></SelectTrigger>
                  <SelectContent>
                    {!apjTaken && (
                      <SelectItem value="apj">Apoteker Penanggung Jawab (APJ)</SelectItem>
                    )}
                    <SelectItem value="aping">Apoteker Pendamping (Aping)</SelectItem>
                    <SelectItem value="kasir">Kasir</SelectItem>
                  </SelectContent>
                </Select>
                {apjTaken && (
                  <p className="text-xs text-muted-foreground">Posisi APJ sudah terisi. Hubungi Admin jika ada pertanyaan.</p>
                )}
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  "Daftar"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Sudah punya akun?{" "}
                <Link to="/" className="text-primary hover:underline font-medium">Masuk di sini</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
