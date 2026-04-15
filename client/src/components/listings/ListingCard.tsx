import { Link } from 'react-router-dom'
import { Clock, Heart } from 'lucide-react'
import type { ListingPreview } from '../../types'
import { formatPrice } from '../../lib/utils'
import { CATEGORY_LABELS, CONDITION_LABELS } from '../../constants/listings'
import CountdownTimer from './CountdownTimer'
import styles from './ListingCard.module.css'

interface ListingCardProps {
  listing: ListingPreview
}

export default function ListingCard({ listing }: ListingCardProps) {
  const price = listing.current_highest_bid ?? listing.starting_price
  const hasPhoto = listing.photo_urls.length > 0
  const isEnded = new Date(listing.bid_ends_at).getTime() <= Date.now()

  return (
    <Link to={`/listings/${listing.id}`} className={styles.card}>
      {/* Photo */}
      <div className={styles.photo}>
        {hasPhoto ? (
          <img
            src={listing.photo_urls[0]}
            alt={listing.title}
            className={styles.img}
            loading="lazy"
          />
        ) : (
          <div className={styles.photoPlaceholder} aria-hidden="true">
            <span className={styles.placeholderInitial}>
              {listing.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}

        <div className={`${styles.timerBadge} ${isEnded ? styles.timerBadgeEnded : ''}`}>
          {!isEnded && <Clock size={11} aria-hidden="true" />}
          <CountdownTimer endsAt={listing.bid_ends_at} />
        </div>

        {listing.current_highest_bid && (
          <div className={styles.bidsBadge}>
            {listing.current_highest_bid > listing.starting_price ? 'Bids' : 'No bids'}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{CATEGORY_LABELS[listing.category]}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.size}>{listing.size}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.condition}>{CONDITION_LABELS[listing.condition]}</span>
        </div>

        <h3 className={styles.title}>{listing.title}</h3>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>
              {listing.current_highest_bid ? 'Current bid' : 'Starting at'}
            </span>
            <span className={styles.price}>{formatPrice(price)}</span>
          </div>
          <div className={styles.charity}>
            <Heart size={11} aria-hidden="true" />
            <span className={styles.charityName}>{listing.charity.name}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
