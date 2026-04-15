import { useState, useEffect, useRef } from 'react'

interface CountdownTimerProps {
  endsAt: string
  onExpire?: () => void
  className?: string
}

function getInterval(diffMs: number): number {
  if (diffMs < 5 * 60 * 1000)  return 1_000   // < 5 min  -> every second
  if (diffMs < 60 * 60 * 1000) return 10_000  // < 1 hour -> every 10s
  return 60_000                                // else     -> every minute
}

function format(diffMs: number): string {
  if (diffMs <= 0) return 'Ended'
  const subDay   = diffMs % (1000 * 60 * 60 * 24)
  const totalSec = Math.floor(subDay / 1000)
  const hours = Math.floor(totalSec / 3600)
  const mins  = Math.floor((totalSec % 3600) / 60)
  const secs  = totalSec % 60

  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0)  return `${mins}m ${secs}s`
  return `${secs}s`
}

export default function CountdownTimer({ endsAt, onExpire, className }: CountdownTimerProps) {
  const endTime = new Date(endsAt).getTime()
  const [diffMs, setDiffMs] = useState(() => endTime - Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    function tick() {
      const remaining = endTime - Date.now()
      setDiffMs(remaining)

      if (remaining <= 0) {
        if (!expiredRef.current) {
          expiredRef.current = true
          onExpire?.()
        }
        return
      }

      timerRef.current = setTimeout(tick, getInterval(remaining))
    }

    tick()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [endTime, onExpire])

  const isUrgent = diffMs > 0 && diffMs < 30 * 60 * 1000 // < 30 min
  const isEnded  = diffMs <= 0

  return (
    <span
      className={className}
      style={{ color: isEnded ? 'var(--color-text-muted)' : isUrgent ? 'var(--color-error)' : 'inherit' }}
      aria-label={isEnded ? 'Auction ended' : `Time remaining: ${format(diffMs)}`}
    >
      {format(diffMs)}
    </span>
  )
}
