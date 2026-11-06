import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { listProducts } from '../../services/products.service'
import type { Product } from '../../lib/types'
import { ProductsContext } from '../../context/products-context'

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await listProducts())
      setError(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load products.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshProducts(), 0)
    return () => window.clearTimeout(timer)
  }, [refreshProducts])

  return (
    <ProductsContext.Provider value={{ products, loading, error, refreshProducts }}>
      {children}
    </ProductsContext.Provider>
  )
}
