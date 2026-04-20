import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Tombol Edit/Hapus hanya boleh untuk APJ & APING.
 * Kasir TIDAK boleh edit/hapus data master.
 */
export const useCanEdit = (): boolean => {
  const { role } = useAuthContext();
  return role === 'apj' || role === 'admin' || role === 'aping';
};

/**
 * Aksi destruktif (hapus user, hapus supplier, dll) hanya APJ.
 */
export const useIsAPJ = (): boolean => {
  const { role } = useAuthContext();
  return role === 'apj' || role === 'admin';
};
