import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: ReactNode
  tone?: 'sage' | 'terracotta' | 'butter' | 'plum'
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'sage',
}: MetricCardProps) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </article>
  )
}
