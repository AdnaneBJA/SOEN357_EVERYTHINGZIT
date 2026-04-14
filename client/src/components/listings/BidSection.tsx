import { useState, type FormEvent } from 'react'
import { Clock, Gavel, Gift } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { formatPrice } from '../../lib/utils'
import type { ListingWithDetails } from '../../types'
import Button from '../ui/Button'
import CountdownTimer from './CountdownTimer'
import styles from './BidSection.module.css'

interface BidSectionProps {
  listing: ListingWithDetails
  onBidPlaced: () => void
  onExpire: () => void
}

export default function BidSection({ listing, onBidPlaced, onExpire }: BidSectionProps) {
  const { user, profile } = useAuth()
  const { addToast } = useToast()

  const [bidAmount, setBidAmount] = useState('')
  const [bidLoading, setBidLoading] = useState(false)
  const [donateLoading, setDonateLoading] = useState(false)

  const currentPrice = listing.current_highest_bid ?? listing.starting_price
  const minBid = currentPrice + 1
  const isActive = listing.status === 'active'
  const isSeller = user?.id === listing.seller_id
  const isEnded = new Date(listing.bid_ends_at) <= new Date()

  const statusLabels: Record<string, { label: string; className: string }> = {
    active:         { label: 'Live',          className: styles.statusActive },
    sold:           { label: 'Sold',          className: styles.statusSold },
    donated:        { label: 'Donated',       className: styles.statusDonated },
    direct_donated: { label: 'Donated',       className: styles.statusDonated },
  }
  const statusInfo = statusLabels[listing.status] ?? { label: listing.status, className: '' }

  async function handleBid(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount < minBid) {
      addToast(`Minimum bid is ${formatPrice(minBid)}`, 'warning')
      return
    }
    setBidLoading(true)
    const { error } = await supabase.rpc('place_bid', {
      p_listing_id: listing.id,
      p_bidder_id:  user.id,
      p_amount:     amount,
    })
    setBidLoading(false)
    if (error) {
      addToast(error.message, 'error')
    } else {
      addToast('Bid placed!', 'success')
      setBidAmount('')
      onBidPlaced()
    }
  }

  async function handleDonateDirect() {
    if (!user) return
    setDonateLoading(true)
    const { error } = await supabase.rpc('donate_direct', { p_listing_id: listing.id })
    setDonateLoading(false)
    if (error) {
      addToast(error.message, 'error')
    } else {
      addToast('Item donated directly!', 'success')
      onBidPlaced()
    }
  }

  return (
    <div className={styles.section}>
      {/* Status + Timer */}
      <div className={styles.topRow}>
        <span className={`${styles.status} ${statusInfo.className}`}>{statusInfo.label}</span>
        {isActive && (
          <div className={styles.timer}>
            <Clock size={13} aria-hidden="true" />
            <CountdownTimer endsAt={listing.bid_ends_at} onExpire={onExpire} />
          </div>
        )}
      </div>

      {/* Price */}
      <div className={styles.priceBlock}>
        <p className={styles.priceLabel}>
          {listing.current_highest_bid ? 'Current bid' : 'Starting price'}
        </p>
        <p className={styles.price}>{formatPrice(currentPrice)}</p>
        <p className={styles.bidCount}>
          {listing.bids.length} bid{listing.bids.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      {isActive && !isEnded && (
        <>
          {!user && (
            <div className={styles.authPrompt}>
              <a href="/login" className={styles.authLink}>Sign in</a> to place a bid
            </div>
          )}

          {user && !isSeller && (
            <form onSubmit={handleBid} className={styles.bidForm}>
              <div className={styles.bidInputWrap}>
                <span className={styles.currencySymbol}>CA$</span>
                <input
                  type="number"
                  className={styles.bidInput}
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  min={minBid}
                  step="1"
                  placeholder={`${minBid} or more`}
                  aria-label="Bid amount in CAD"
                  required
                />
              </div>
              <p className={styles.minBidHint}>Minimum bid: {formatPrice(minBid)}</p>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={bidLoading}
              >
                <Gavel size={16} aria-hidden="true" />
                Place bid
              </Button>
            </form>
          )}

          {user && isSeller && (
            <div className={styles.sellerActions}>
              <p className={styles.sellerNote}>
                This is your listing. You can skip the auction and donate directly.
              </p>
              <Button
                variant="ghost"
                fullWidth
                loading={donateLoading}
                onClick={handleDonateDirect}
              >
                <Gift size={15} aria-hidden="true" />
                Donate directly
              </Button>
            </div>
          )}

          {user && profile?.role === 'charity_rep' && !isSeller && (
            <p className={styles.repNote}>
              Bidding as a charity representative.
            </p>
          )}
        </>
      )}

      {!isActive && (
        <div className={styles.closedNote}>
          <p className={styles.closedText}>
            {listing.status === 'sold'
              ? `Sold for ${formatPrice(listing.current_highest_bid ?? 0)}`
              : 'This item has been donated to the charity.'}
          </p>
        </div>
      )}
    </div>
  )
}
