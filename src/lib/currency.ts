/**
 * Format number as Indonesian Rupiah: Rp 1.250.000
 */
export const formatRupiah = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Format number with thousand separator (dot): 1.500
 */
export const formatNumber = (n: number): string => {
  return n.toLocaleString('id-ID');
};
