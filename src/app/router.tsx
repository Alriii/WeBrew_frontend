import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/common/AppLayout'
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    HydrateFallback: () => <div className="route-loading" role="status">Pouring your dashboard…</div>,
    children: [
      {
        index: true,
        lazy: async () => {
          const { DashboardPage } = await import('../components/features/dashboard/DashboardPage')
          return { Component: DashboardPage }
        },
      },
      {
        path: 'sales',
        lazy: async () => {
          const { SalesPage } = await import('../components/features/sales/SalesPage')
          return { Component: SalesPage }
        },
      },
      {
        path: 'products',
        lazy: async () => {
          const { ProductsPage } = await import('../components/features/products/ProductsPage')
          return { Component: ProductsPage }
        },
      },
    ],
  },
])
