// Utility function to format Vietnamese currency
export const formatVND = (amount) => {
  if (!amount && amount !== 0) return '₫0'
  return `₫${Number(amount).toLocaleString('vi-VN')}`
}

// Alternative format with currency symbol
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 VND'
  return `${Number(amount).toLocaleString('vi-VN')} VND`
}
