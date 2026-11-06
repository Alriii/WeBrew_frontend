import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'

interface NoticeProps {
  message: string
  onRetry?: () => void
  success?: boolean
}

export function Notice({ message, onRetry, success = false }: NoticeProps) {
  return (
    <div className={`notice ${success ? 'notice-success' : 'notice-error'}`} role="status">
      {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
      {onRetry && (
        <Button variant="quiet" icon={<RefreshCw size={15} />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
