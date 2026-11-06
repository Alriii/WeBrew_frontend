import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Cloud,
  CloudRain,
  Coffee,
  Leaf,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MetricCard } from '../../common/MetricCard'
import { Notice } from '../../common/Notice'
import { Button } from '../../ui/Button'
import { categoryLabel, count, formatDate, formatHour, money } from '../../../lib/format'
import type {
  DashboardStats,
  ForecastDay,
  Recommendation,
  Sale,
} from '../../../lib/types'
import {
  getDashboardStats,
  getForecast,
  getRecommendations,
} from '../../../services/dashboard.service'
import { listSales } from '../../../services/sales.service'

interface DashboardData {
  stats: DashboardStats
  forecast: ForecastDay[]
  recommendations: Recommendation[]
  recentSales: Sale[]
}

const pieColors = ['#9caf88', '#d58a70', '#e5c777', '#9383a0', '#8baab0']

function currency(value: number) {
  return money.format(value)
}

function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [stats, forecast, recommendations, sales] = await Promise.all([
        getDashboardStats(),
        getForecast(),
        getRecommendations(),
        listSales(),
      ])
      setData({
        stats,
        forecast,
        recommendations,
        recentSales: sales.slice(0, 5),
      })
      setError(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load the dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void refresh(), 0)
    const timer = window.setInterval(() => void refresh(), 60_000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [refresh])

  return { data, loading, error, refresh }
}

function LoadingPanel({ height = 220 }: { height?: number }) {
  return <div className="loading-panel" style={{ minHeight: height }} aria-label="Loading data"><span /></div>
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>{currency(Number(payload[0].value))}</span>
    </div>
  )
}

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard()
  const busiestHour = useMemo(() => {
    if (!data?.stats.hourlySales.length) return null
    return [...data.stats.hourlySales].sort((a, b) => b.unitsSold - a.unitsSold)[0]
  }, [data])

  if (loading && !data) {
    return (
      <div className="dashboard-stack">
        <LoadingPanel height={120} />
        <div className="metric-grid">{Array.from({ length: 4 }, (_, i) => <LoadingPanel key={i} height={138} />)}</div>
        <LoadingPanel height={300} />
      </div>
    )
  }

  if (error && !data) {
    return <Notice message={error} onRetry={() => void refresh()} />
  }

  if (!data) return null

  const { stats, forecast, recommendations, recentSales } = data
  const ratingCount = stats.ratingDistribution.reduce((total, item) => total + item.count, 0)
  const salesTrend = stats.dailySales.map((day) => ({
    ...day,
    shortDate: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`)),
  }))
  const productMix = stats.topProducts.map((item) => ({
    name: item.productName,
    units: item.unitsSold,
  }))
  return (
    <div className="dashboard-stack">
      {error && <Notice message={error} onRetry={() => void refresh()} />}

      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-tag"><Sparkles size={14} /> YOUR LITTLE DAILY BRIEF</span>
          <h2>Good things are brewing.</h2>
          <p>Here’s the latest on your cups, customers and the little details that keep WeBrew growing.</p>
          <Link to="/sales" className="banner-link">Explore your sales <ArrowRight size={15} /></Link>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="sun-disc" />
          <div className="steam steam-one" />
          <div className="steam steam-two" />
          <div className="cup"><div className="cup-coffee" /><div className="cup-handle" /><span>W</span></div>
          <span className="art-sparkle sparkle-one">✳</span><span className="art-sparkle sparkle-two">✦</span>
        </div>
      </section>

      <section className="metric-grid" aria-label="Sales at a glance">
        <MetricCard label="Total revenue" value={currency(stats.totalRevenue)} detail="Across all recorded sales" icon={<span className="metric-currency">¤</span>} tone="sage" />
        <MetricCard label="Drinks served" value={count.format(stats.unitsSold)} detail={`${count.format(stats.saleRecordCount)} sale records`} icon={<Coffee size={18} />} tone="terracotta" />
        <MetricCard label="Guest happiness" value={stats.averageRating === null ? '—' : `${stats.averageRating.toFixed(1)} / 5`} detail={ratingCount ? `${count.format(ratingCount)} lovely ratings` : 'Waiting for first ratings'} icon={<Star size={18} />} tone="butter" />
        <MetricCard label="Busiest hour" value={busiestHour ? formatHour(busiestHour.hour) : '—'} detail={busiestHour ? `${count.format(busiestHour.unitsSold)} drinks served` : 'More sales will reveal it'} icon={<Sparkles size={18} />} tone="plum" />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="surface-card chart-card">
          <div className="card-heading">
            <div><p className="eyebrow">THE BIG PICTURE</p><h3>Revenue over time</h3><p className="card-subtitle">A little look at the past 30 days</p></div>
            <span className="chart-legend"><i /> Daily revenue</span>
          </div>
          <div className="chart-area">
            {loading ? <LoadingPanel /> : salesTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 14, right: 12, left: -12, bottom: 0 }}>
                  <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#829878" stopOpacity={0.24} /><stop offset="95%" stopColor="#829878" stopOpacity={0.01} /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="#eee9df" strokeDasharray="3 5" />
                  <XAxis dataKey="shortDate" tickLine={false} axisLine={false} tick={{ fill: '#999187', fontSize: 11 }} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#999187', fontSize: 11 }} tickFormatter={(value: number) => `${value}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#718a68" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 5, fill: '#718a68', stroke: '#fff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty"><span className="empty-icon"><Coffee size={19} /></span><strong>Your first sale starts the story.</strong><p>Once you record a sale, the chart will appear here.</p><Link to="/sales">Record a sale <ArrowRight size={14} /></Link></div>}
          </div>
          <div className="chart-footnote"><span><i className="tiny-dot" /> Revenue is quantity × price per drink</span><Link to="/sales">View sales <ArrowRight size={14} /></Link></div>
        </article>

        <article className="surface-card trend-card">
          <div className="card-heading">
            <div><p className="eyebrow">THE LITTLE FORECAST</p><h3>What might be next</h3><p className="card-subtitle">A gentle guide, based on recent days</p></div>
            <span className="forecast-icon"><Sun size={20} /></span>
          </div>
          <div className="forecast-highlight"><span>Average daily estimate</span><strong>{forecast.length ? currency(forecast[0].forecastRevenue) : currency(0)}</strong><small>For the next 7 days</small></div>
          <div className="forecast-days">
            {forecast.slice(0, 5).map((day) => (
              <div className="forecast-day" key={day.date}><span>{formatDate(`${day.date}T00:00:00Z`, { weekday: 'short', timeZone: 'UTC' })}</span><div className="forecast-track"><i style={{ width: `${forecast[0]?.forecastRevenue ? Math.max((day.forecastRevenue / forecast[0].forecastRevenue) * 100, 8) : 0}%` }} /></div><strong>{currency(day.forecastRevenue)}</strong></div>
            ))}
          </div>
          <p className="subtle-note"><Sparkles size={13} /> A simple 14-day average, not a guarantee.</p>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="surface-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">WHEN THE DOOR IS BUSIEST</p><h3>Your hourly rhythm</h3></div><span className="soft-icon"><ShoppingBag size={17} /></span></div>
          {stats.hourlySales.length ? (
            <div className="hour-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlySales} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eee9df" strokeDasharray="3 5" />
                  <XAxis dataKey="hour" tickFormatter={formatHour} interval="preserveStartEnd" tickLine={false} axisLine={false} tick={{ fill: '#999187', fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#999187', fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} drinks`, 'Served']} labelFormatter={(hour) => formatHour(Number(hour))} />
                  <Bar dataKey="unitsSold" radius={[5, 5, 1, 1]} maxBarSize={28}>{stats.hourlySales.map((item, index) => <Cell key={item.hour} fill={item.hour === busiestHour?.hour ? '#b7654d' : index % 2 ? '#c4cbb5' : '#9caf88'} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="small-empty">Your hourly pattern will show here after sales are recorded.</div>}
          <div className="chart-footnote"><span>Hours shown in UTC</span>{busiestHour && <span>Peak: <strong>{formatHour(busiestHour.hour)}</strong></span>}</div>
        </article>

        <article className="surface-card prep-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">A THOUGHTFUL HEAD START</p><h3>Tomorrow’s prep</h3></div><span className="soft-icon"><PackageCheck size={17} /></span></div>
          <p className="card-subtitle prep-caption">A starting point from the last 28 days of sales.</p>
          <div className="prep-list">
            {recommendations.map((item, index) => {
              const isCoffee = item.category === 'coffee'
              const Icon = isCoffee ? Coffee : Leaf
              return <div className="prep-item" key={item.category}><span className={`prep-product-icon ${isCoffee ? 'prep-coffee' : 'prep-tea'}`}><Icon size={17} /></span><span className="prep-name">{categoryLabel(item.category)}<small>{item.averageUnitsPerDay} cups/day average</small></span><strong>{item.suggestedUnits}<small>cups</small></strong>{index === 0 ? <ArrowUpRight size={15} className="prep-trend" /> : <ArrowDownRight size={15} className="prep-trend prep-down" />}</div>
            })}
          </div>
          <p className="subtle-note"><Sparkles size={13} /> Suggestions don’t include your current stock.</p>
        </article>

        <article className="surface-card mix-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">GUEST FAVORITES</p><h3>Top little picks</h3></div><span className="soft-icon"><Coffee size={17} /></span></div>
          {productMix.length ? (
            <div className="mix-layout">
              <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={productMix} dataKey="units" nameKey="name" innerRadius="65%" outerRadius="92%" paddingAngle={4} stroke="none">{productMix.map((item, index) => <Cell key={item.name} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip formatter={(value) => [`${value} drinks`, 'Sold']} /></PieChart></ResponsiveContainer><div className="donut-center"><Star size={14} /><span>so loved</span></div></div>
              <div className="legend-list">{productMix.slice(0, 4).map((item, index) => <div className="legend-row" key={item.name}><i style={{ backgroundColor: pieColors[index % pieColors.length] }} /><span>{item.name}</span><strong>{item.units}</strong></div>)}</div>
            </div>
          ) : <div className="small-empty">Popular drinks will show once sales are recorded.</div>}
        </article>

        <article className="surface-card rating-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">KIND WORDS, IN NUMBERS</p><h3>Guest love</h3></div><span className="soft-icon soft-icon-butter"><Star size={17} /></span></div>
          <div className="rating-summary"><strong>{stats.averageRating === null ? '—' : stats.averageRating.toFixed(1)}</strong><span>/ 5</span><div className="rating-stars" aria-label="Average guest rating">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={stats.averageRating !== null && i < Math.round(stats.averageRating) ? 'currentColor' : 'none'} />)}</div></div>
          <div className="rating-bars">{[5, 4, 3, 2, 1].map((rating) => { const ratingRow = stats.ratingDistribution.find((row) => row.rating === rating); const percent = ratingCount ? ((ratingRow?.count ?? 0) / ratingCount) * 100 : 0; return <div className="rating-row" key={rating}><span>{rating} <Star size={11} fill="currentColor" /></span><div className="rating-track"><i style={{ width: `${percent}%` }} /></div><strong>{ratingRow?.count ?? 0}</strong></div> })}</div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-bottom">
        <article className="surface-card recent-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">FRESH FROM THE COUNTER</p><h3>Recent sales</h3></div><Link to="/sales" className="text-link">All sales <ArrowRight size={14} /></Link></div>
          {recentSales.length ? (
            <div className="recent-list">{recentSales.map((sale) => <div className="recent-row" key={sale.id}><span className={`recent-icon ${sale.category}`}><Coffee size={16} /></span><span className="recent-product">{sale.productName}<small>{sale.quantity} cup{sale.quantity === 1 ? '' : 's'} · {formatDate(sale.saleDate, { month: 'short', day: 'numeric' })}</small></span><strong>{currency(sale.quantity * sale.price)}</strong><span className="recent-status"><i /> Recorded</span></div>)}</div>
          ) : <div className="small-empty">No sales recorded yet. The first one's always special.</div>}
        </article>

        <article className="surface-card weather-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">A LITTLE WEATHER NOTE</p><h3>Sales & sunshine</h3></div><span className="soft-icon"><Cloud size={17} /></span></div>
          <p className="card-subtitle">How sales looked on days you recorded weather.</p>
          {stats.weatherImpact.length ? <div className="weather-list">{stats.weatherImpact.map((item) => { const WeatherIcon = item.condition === 'rainy' ? CloudRain : item.condition === 'cloudy' ? Cloud : Sun; return <div className="weather-row" key={item.condition}><span className={`weather-icon weather-${item.condition}`}><WeatherIcon size={16} /></span><span>{item.condition[0].toUpperCase() + item.condition.slice(1)}<small>{item.transactionCount} sale records</small></span><strong>{currency(item.averageSaleRevenue)}</strong></div> })}</div> : <div className="weather-empty"><Cloud size={20} /><span>Record weather with a sale to spot a pattern.</span></div>}
          <p className="subtle-note"><Sparkles size={13} /> A pattern, not proof of cause.</p>
        </article>
      </section>
      <div className="dashboard-bottom-note"><span>One cup at a time <i>✳</i></span><Button variant="quiet" onClick={() => void refresh()}>{loading ? 'Updating…' : 'Refresh overview'} <ArrowRight size={14} /></Button></div>
    </div>
  )
}
