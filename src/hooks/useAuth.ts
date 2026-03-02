import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'apoteker' | 'asisten_apoteker' | 'kasir';

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

// Role-based menu access map
export const roleMenuAccess: Record<AppRole, string[]> = {
  admin: ['dashboard', 'transactions', 'inventory', 'procurement', 'reports', 'customers', 'users', 'settings'],
  apoteker: ['dashboard', 'transactions', 'inventory', 'procurement', 'reports', 'customers', 'users', 'settings'],
  asisten_apoteker: ['dashboard', 'inventory', 'procurement', 'reports'],
  kasir: ['dashboard', 'transactions', 'customers'],
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
        supabase.from('user_roles').select('role').eq('user_id', userId).single(),
      ]);
      if (profileRes.data) setProfile(profileRes.data as AuthState['profile']);
      if (roleRes.data) setRole(roleRes.data.role as AppRole);
      else setRole('kasir'); // default role
    } catch {
      setRole('kasir');
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, meta: { full_name: string; username: string; role: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: meta.full_name, username: meta.username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };

    // Assign the requested role
    if (data.user) {
      const roleMap: Record<string, AppRole> = {
        'aping': 'asisten_apoteker',
        'kasir': 'kasir',
      };
      const appRole = roleMap[meta.role] || 'kasir';
      await supabase.from('user_roles').insert({ user_id: data.user.id, role: appRole });
    }

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
