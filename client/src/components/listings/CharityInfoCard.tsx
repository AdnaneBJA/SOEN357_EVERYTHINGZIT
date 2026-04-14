import { MapPin, Clock, Heart } from 'lucide-react'
import type { Charity } from '../../types'
import { formatPickupDays } from '../../lib/utils'
import styles from './CharityInfoCard.module.css'

interface CharityInfoCardProps {
  charity: Charity
}

export default function CharityInfoCard({ charity }: CharityInfoCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {charity.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className={styles.label}>Proceeds benefit</p>
          <h3 className={styles.name}>{charity.name}</h3>
        </div>
      </div>

      <p className={styles.description}>{charity.description}</p>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <MapPin size={13} aria-hidden="true" />
          <span>{charity.city}</span>
        </div>
        <div className={styles.metaItem}>
          <Clock size={13} aria-hidden="true" />
          <span>Pickup: {formatPickupDays(charity.pickup_days)}</span>
        </div>
      </div>

      <div className={styles.badge}>
        <Heart size={12} aria-hidden="true" />
        100% of proceeds go to this charity
      </div>
    </div>
  )
}
