import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type MemberTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Customer {
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

interface CustomerState {
  customers: Customer[];
  _loaded: boolean;
  fetchAll: () => Promise<void>;
  addCustomer: (c: Omit<Customer, 'id' | 'memberId' | 'tier' | 'points' | 'totalSpent' | 'totalVisits' | 'joinDate' | 'lastVisit'>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  redeemPoints: (id: string, amount: number) => Promise<void>;
}

const mapCustomer = (r: any): Customer => ({
  id: r.id,
  name: r.name || '',
  phone: r.phone || '',
  address: r.address || '',
  birthDate: r.birth_date || '',
  memberId: r.member_id || '',
  tier: (r.tier || 'Bronze') as MemberTier,
  points: Number(r.points) || 0,
  totalSpent: Number(r.total_spent) || 0,
  totalVisits: Number(r.total_visits) || 0,
  allergies: Array.isArray(r.allergies) ? r.allergies : [],
  medicalNotes: r.medical_notes || '',
  joinDate: r.join_date || '',
  lastVisit: r.last_visit || '',
});

export const useCustomerStore = create<CustomerState>()((set, get) => ({
  customers: [],
  _loaded: false,

  fetchAll: async () => {
    const { data } = await supabase.from('customers').select('*');
    set({ customers: (data || []).map(mapCustomer), _loaded: true });
  },

  addCustomer: async (c) => {
    const num = get().customers.length + 1;
    const memberId = `MBR-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`;
    const joinDate = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase.from('customers').insert({
      name: c.name, phone: c.phone, address: c.address, birth_date: c.birthDate,
      member_id: memberId, tier: 'Bronze', points: 0, total_spent: 0, total_visits: 0,
      allergies: c.allergies as any, medical_notes: c.medicalNotes, join_date: joinDate, last_visit: '-',
    }).select().single();
    if (error) throw error;
    set((s) => ({ customers: [...s.customers, mapCustomer(data)] }));
  },

  updateCustomer: async (id, data) => {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.address !== undefined) update.address = data.address;
    if (data.birthDate !== undefined) update.birth_date = data.birthDate;
    if (data.tier !== undefined) update.tier = data.tier;
    if (data.points !== undefined) update.points = data.points;
    if (data.totalSpent !== undefined) update.total_spent = data.totalSpent;
    if (data.totalVisits !== undefined) update.total_visits = data.totalVisits;
    if (data.allergies !== undefined) update.allergies = data.allergies as any;
    if (data.medicalNotes !== undefined) update.medical_notes = data.medicalNotes;
    if (data.lastVisit !== undefined) update.last_visit = data.lastVisit;

    await supabase.from('customers').update(update).eq('id', id);
    set((s) => ({ customers: s.customers.map((cu) => cu.id === id ? { ...cu, ...data } : cu) }));
  },

  removeCustomer: async (id) => {
    await supabase.from('customers').delete().eq('id', id);
    set((s) => ({ customers: s.customers.filter((cu) => cu.id !== id) }));
  },

  redeemPoints: async (id, amount) => {
    const cust = get().customers.find((c) => c.id === id);
    if (!cust) return;
    const newPoints = Math.max(0, cust.points - amount);
    await supabase.from('customers').update({ points: newPoints }).eq('id', id);
    set((s) => ({ customers: s.customers.map((c) => c.id === id ? { ...c, points: newPoints } : c) }));
  },
}));
