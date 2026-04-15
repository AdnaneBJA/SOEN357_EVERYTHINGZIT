import { Package, CalendarCheck, CheckCircle } from 'lucide-react'
import type { Pickup, ListingStatus } from '../../types'
import styles from './PickupTracker.module.css'

interface PickupTrackerProps {
  pickup: Pickup
  status: ListingStatus
}

const STEPS: { key: Pickup['status']; Icon: typeof Package; label: string; desc: string }[] = [
  { key: 'pending',   Icon: Package,      label: 'Pending',   desc: 'Waiting for charity to schedule pickup.' },
  { key: 'scheduled', Icon: CalendarCheck, label: 'Scheduled', desc: 'Pickup has been scheduled.' },
  { key: 'collected', Icon: CheckCircle,   label: 'Collected', desc: 'Item collected by the charity.' },
]

const STATUS_ORDER: Record<Pickup['status'], number> = {
  pending: 0, scheduled: 1, collected: 2,
}

export default function PickupTracker({ pickup, status }: PickupTrackerProps) {
  const currentIdx = STATUS_ORDER[pickup.status]

  const outcomeLabel =
    status === 'sold'           ? 'Sold at auction'  :
    status === 'donated'        ? 'Auto-donated'     :
    status === 'direct_donated' ? 'Directly donated' : ''

  return (
    <div className={styles.tracker}>
      <div className={styles.header}>
        <h3 className={styles.title}>Pickup status</h3>
        {outcomeLabel && <span className={styles.outcome}>{outcomeLabel}</span>}
      </div>

      {pickup.scheduled_date && pickup.status === 'scheduled' && (
        <p className={styles.scheduledDate}>
          Scheduled for{' '}
          <strong>
            {new Date(pickup.scheduled_date).toLocaleDateString('en-CA', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </strong>
        </p>
      )}

      <div className={styles.steps}>
        {STEPS.map(({ key, Icon, label, desc }, i) => {
          const done    = i <= currentIdx
          const current = i === currentIdx
          return (
            <div key={key} className={`${styles.step} ${done ? styles.stepDone : ''} ${current ? styles.stepCurrent : ''}`}>
              <div className={styles.iconWrap}>
                <Icon size={16} aria-hidden="true" />
                {i < STEPS.length - 1 && <div className={`${styles.line} ${i < currentIdx ? styles.lineDone : ''}`} />}
              </div>
              <div className={styles.stepText}>
                <span className={styles.stepLabel}>{label}</span>
                <span className={styles.stepDesc}>{desc}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
