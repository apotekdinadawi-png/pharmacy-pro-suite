import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RoleName = 'Apoteker' | 'Asisten Apoteker' | 'Kasir';

export interface BusinessSettings {
  namaApotek: string;
  alamat: string;
  noSIA: string;
  ppnPercent: number;
}

export interface InventorySettings {
  stokKritis: number;
  reminderKadaluwarsa: number; // in months
}

export interface UnitItem {
  id: string;
  name: string;
}

export interface CategoryItem {
  id: string;
  name: string;
}

export interface MasterDataSettings {
  units: UnitItem[];
  categories: CategoryItem[];
}

export interface LoyaltySettings {
  pointValue: number; // 1 poin = Rp X
  goldThreshold: number; // total belanja untuk Gold
}

export interface RolePermission {
  role: RoleName;
  permissions: string[];
}

export interface SettingsState {
  business: BusinessSettings;
  inventory: InventorySettings;
  masterData: MasterDataSettings;
  loyalty: LoyaltySettings;
  roles: RolePermission[];
  setBusiness: (b: Partial<BusinessSettings>) => void;
  setInventory: (i: Partial<InventorySettings>) => void;
  setMasterData: (m: Partial<MasterDataSettings>) => void;
  addUnit: (name: string) => void;
  removeUnit: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  setLoyalty: (l: Partial<LoyaltySettings>) => void;
  setRolePermissions: (role: RoleName, permissions: string[]) => void;
}

const allPermissions = [
  'dashboard', 'transaksi', 'inventaris', 'pengadaan', 'laporan', 'pelanggan', 'manajemen_user', 'pengaturan'
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      business: {
        namaApotek: 'ApotekPro',
        alamat: 'Jl. Sehat No. 1, Jakarta',
        noSIA: 'SIA-001/DINAS/2024',
        ppnPercent: 11,
      },
      inventory: {
        stokKritis: 10,
        reminderKadaluwarsa: 3,
      },
      masterData: {
        units: [
          { id: '1', name: 'Tablet' },
          { id: '2', name: 'Kapsul' },
          { id: '3', name: 'Botol' },
          { id: '4', name: 'Box' },
          { id: '5', name: 'Strip' },
          { id: '6', name: 'Tube' },
          { id: '7', name: 'Ampul' },
        ],
        categories: [
          { id: '1', name: 'Obat Bebas' },
          { id: '2', name: 'Obat Bebas Terbatas' },
          { id: '3', name: 'Obat Keras' },
          { id: '4', name: 'Obat Narkotika' },
          { id: '5', name: 'Obat Psikotropika' },
        ],
      },
      loyalty: {
        pointValue: 5000,
        goldThreshold: 500000,
      },
      roles: [
        { role: 'Apoteker', permissions: [...allPermissions] },
        { role: 'Asisten Apoteker', permissions: ['dashboard', 'transaksi', 'inventaris', 'pengadaan', 'pelanggan'] },
        { role: 'Kasir', permissions: ['dashboard', 'transaksi', 'pelanggan'] },
      ],
      setBusiness: (b) => set((s) => ({ business: { ...s.business, ...b } })),
      setInventory: (i) => set((s) => ({ inventory: { ...s.inventory, ...i } })),
      setMasterData: (m) => set((s) => ({ masterData: { ...s.masterData, ...m } })),
      addUnit: (name) => set((s) => ({
        masterData: { ...s.masterData, units: [...s.masterData.units, { id: crypto.randomUUID(), name }] }
      })),
      removeUnit: (id) => set((s) => ({
        masterData: { ...s.masterData, units: s.masterData.units.filter((u) => u.id !== id) }
      })),
      addCategory: (name) => set((s) => ({
        masterData: { ...s.masterData, categories: [...s.masterData.categories, { id: crypto.randomUUID(), name }] }
      })),
      removeCategory: (id) => set((s) => ({
        masterData: { ...s.masterData, categories: s.masterData.categories.filter((c) => c.id !== id) }
      })),
      setLoyalty: (l) => set((s) => ({ loyalty: { ...s.loyalty, ...l } })),
      setRolePermissions: (role, permissions) => set((s) => ({
        roles: s.roles.map((r) => r.role === role ? { ...r, permissions } : r),
      })),
    }),
    { name: 'apotek-settings' }
  )
);
