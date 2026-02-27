import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Apoteker' | 'Asisten Apoteker' | 'Kasir';
export type UserStatus = 'Aktif' | 'Nonaktif';

export interface StaffUser {
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

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'auth' | 'transaksi' | 'inventaris' | 'pengadaan' | 'sistem';
  detail: string;
  timestamp: string;
  ip: string;
}

interface UserState {
  users: StaffUser[];
  logs: ActivityLog[];
  addUser: (u: Omit<StaffUser, 'id'>) => void;
  updateUser: (id: string, data: Partial<StaffUser>) => void;
  removeUser: (id: string) => void;
  toggleStatus: (id: string) => void;
  addLog: (l: Omit<ActivityLog, 'id'>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [],
      logs: [],
      addUser: (u) => set((s) => ({ users: [...s.users, { ...u, id: crypto.randomUUID() }] })),
      updateUser: (id, data) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, ...data } : u) })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      toggleStatus: (id) => set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : u),
      })),
      addLog: (l) => set((s) => ({ logs: [...s.logs, { ...l, id: crypto.randomUUID() }] })),
    }),
    { name: 'apotek-users' }
  )
);
