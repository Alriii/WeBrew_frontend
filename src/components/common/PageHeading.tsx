import type { ReactNode } from 'react'

interface PageHeadingProps {
  kicker: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHeading({ kicker, title, description, action }: PageHeadingProps) {
  return (
    <div className="section-heading-row">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
