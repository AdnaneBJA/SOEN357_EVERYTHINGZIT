import { TrendingUp } from 'lucide-react'
import type { Bid } from '../../types'
import { formatPrice, formatTimeAgo, getInitials } from '../../lib/utils'
import styles from './BidHistory.module.css'

interface BidWithBidder extends Bid {
  bidder: { display_name: string | null } | null
}

interface BidHistoryProps {
  bids: BidWithBidder[]
}

export default function BidHistory({ bids }: BidHistoryProps) {
  const sorted = [...bids].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <TrendingUp size={20} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyText}>No bids yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {sorted.map((bid, i) => {
        const name = bid.bidder?.display_name ?? 'Anonymous'
        const isWinning = i === 0
        return (
          <div key={bid.id} className={`${styles.row} ${isWinning ? styles.rowWinning : ''}`}>
            <div className={styles.avatar} aria-hidden="true">
              {getInitials(name)}
            </div>
            <div className={styles.info}>
              <span className={styles.bidder}>{name}</span>
              <span className={styles.time}>{formatTimeAgo(bid.created_at)}</span>
            </div>
            <div className={styles.right}>
              <span className={styles.amount}>{formatPrice(bid.amount)}</span>
              {isWinning && <span className={styles.winningTag}>Winning</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
