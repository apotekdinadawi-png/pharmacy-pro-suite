import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Pill, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }
    // After sign in, check approval status
    const { data: profileData } = await (await import('@/integrations/supabase/client')).supabase
      .from('profiles')
      .select('status')
      .eq('user_id', (await (await import('@/integrations/supabase/client')).supabase.auth.getUser()).data.user?.id || '')
      .single();

    if (profileData?.status === 'pending') {
      await (await import('@/integrations/supabase/client')).supabase.auth.signOut();
      setError("Akun Anda masih menunggu persetujuan Admin. Silakan tunggu.");
      setLoading(false);
      return;
    }
    if (profileData?.status === 'rejected') {
      await (await import('@/integrations/supabase/client')).supabase.auth.signOut();
      setError("Akun Anda ditolak oleh Admin. Hubungi pengelola apotek.");
      setLoading(false);
      return;
    }

    navigate("/dashboard");
    setLoading(false);
  };

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
          <h1 className="text-3xl font-bold text-foreground">ApotekPro</h1>
          <p className="text-muted-foreground mt-1">Sistem Manajemen Apotek Modern</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Belum punya akun?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">Daftar di sini</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
