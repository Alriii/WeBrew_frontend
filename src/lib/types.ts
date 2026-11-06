export type Category = 'coffee' | 'milk_tea'
export type Weather = 'sunny' | 'cloudy' | 'rainy'

export interface Product {
  id: number
  name: string
  category: Category
  price: number
  active: boolean
  createdAt: string
}

export interface Sale {
  id: number
  productId: number | null
  productName: string
  category: Category
  quantity: number
  price: number
  saleDate: string
  customerRating: number | null
  weatherCondition: Weather | null
}

export interface DashboardStats {
  saleRecordCount: number
  unitsSold: number
  totalRevenue: number
  averageRating: number | null
  topProducts: Array<{
    productName: string
    category: Category
    unitsSold: number
    revenue: number
  }>
  dailySales: Array<{ date: string; revenue: number; unitsSold: number }>
  hourlySales: Array<{
    hour: number
    saleRecordCount: number
    unitsSold: number
    revenue: number
  }>
  weatherImpact: Array<{
    condition: Weather
    transactionCount: number
    averageSaleRevenue: number
    unitsSold: number
  }>
  ratingDistribution: Array<{ rating: number; count: number }>
}

export interface ForecastDay {
  date: string
  forecastRevenue: number
}

export interface Recommendation {
  category: Category
  suggestedUnits: number
  averageUnitsPerDay: number
}

export interface ApiList<T> {
  data: T[]
}

export interface ApiData<T> {
  data: T
}

export function isCategory(value: string): value is Category {
  return value === 'coffee' || value === 'milk_tea'
}
