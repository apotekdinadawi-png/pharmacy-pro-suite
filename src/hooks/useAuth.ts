import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'apj' | 'aping' | 'kasir';

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: { full_name: string; username: string; phone: string; sipa: string; status: AccountStatus } | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta: { full_name: string; username: string; role: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const MASTER_EMAIL = 'apotekdinadawi@gmail.com';

// APJ = Super Admin with full access
export const roleMenuAccess: Record<AppRole, string[]> = {
  admin: ['dashboard', 'transactions', 'inventory', 'procurement', 'reports', 'customers', 'users', 'settings'],
  apj: ['dashboard', 'transactions', 'inventory', 'procurement', 'reports', 'customers', 'users', 'settings'],
  aping: ['dashboard', 'inventory', 'procurement', 'reports'],
  kasir: ['dashboard', 'transactions', 'customers'],
};

// Route-to-menu key mapping for route guards
export const routeMenuMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/transactions': 'transactions',
  '/inventory': 'inventory',
  '/procurement': 'procurement',
  '/reports': 'reports',
  '/customers': 'customers',
  '/users': 'users',
  '/settings': 'settings',
};

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthState['profile']>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('full_name, username, phone, sipa, status').eq('user_id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      ]);
      if (profileRes.data) setProfile(profileRes.data as AuthState['profile']);
      if (roleRes.data) setRole(roleRes.data.role as AppRole);
      else setRole('kasir');
    } catch {
      setRole('kasir');
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchProfileAndRole(sess.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchProfileAndRole(sess.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  // Realtime: listen for profile status changes so admin approval/rejection syncs instantly
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status as AccountStatus;
          setProfile(prev => prev ? { ...prev, status: newStatus } : prev);

          // If status changed to non-approved, force sign out
          if (newStatus !== 'approved') {
            supabase.auth.signOut();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Realtime: listen for role changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-role-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            setRole((payload.new as { role: AppRole }).role);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Strict gatekeeper: check profile status
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', data.user.id)
        .maybeSingle();

      const status = profileData?.status;

      if (status !== 'approved') {
        await supabase.auth.signOut();
        if (status === 'rejected') {
          return { error: 'Akun Anda telah ditolak oleh Admin. Hubungi APJ untuk informasi lebih lanjut.' };
        }
        return { error: 'Akun Anda belum disetujui oleh Admin. Silakan tunggu konfirmasi.' };
      }
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, meta: { full_name: string; username: string; role: string }) => {
    // Block master email registration
    if (email.toLowerCase() === MASTER_EMAIL) {
      return { error: 'Email ini tidak dapat digunakan untuk pendaftaran.' };
    }

    // Check blacklist
    const { data: blacklisted } = await supabase
      .from('blacklisted_emails')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (blacklisted) {
      return { error: 'Email ini telah diblokir dari pendaftaran. Hubungi pengelola apotek.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: meta.full_name, username: meta.username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };

    if (data.user) {
      const roleMap: Record<string, AppRole> = { apj: 'apj', aping: 'aping', kasir: 'kasir' };
      const appRole = roleMap[meta.role] || 'kasir';
      await supabase.from('user_roles').insert([{ user_id: data.user.id, role: appRole }]);
    }

    // Sign out immediately - user must wait for approval
    await supabase.auth.signOut();

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return { user, session, profile, role, loading, signIn, signUp, signOut };
};
