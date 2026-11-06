import { createContext } from 'react'
import type { Product } from '../lib/types'

export interface ProductsContextValue {
  products: Product[]
  loading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
}

export const ProductsContext = createContext<ProductsContextValue | null>(null)
