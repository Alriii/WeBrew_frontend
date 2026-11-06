export const APP_NAME = 'WeBrew Café'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const NAV_ITEMS = [
  { label: 'Overview', path: '/', icon: 'overview' },
  { label: 'Sales', path: '/sales', icon: 'sales' },
  { label: 'Products', path: '/products', icon: 'products' },
] as const
