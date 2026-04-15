import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, TrendingDown, Trophy, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatTimeAgo } from '../../lib/utils'
import styles from './NotificationBell.module.css'

const LS_KEY = 'fc_notifs_last_checked'

type NotifType = 'outbid' | 'won' | 'pickup_scheduled'

interface Notification {
  id: string
  type: NotifType
  title: string
  detail: string
  listingId: string
  timestamp: string
}

function getLastChecked(): number {
  return parseInt(localStorage.getItem(LS_KEY) ?? '0', 10)
}

function markChecked() {
  localStorage.setItem(LS_KEY, Date.now().toString())
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifs, setNotifs]   = useState<Notification[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const results: Notification[] = []

    // 1. Outbid: my bids on active listings where current_highest_bid > my amount
    const { data: myBids } = await supabase
      .from('bids')
      .select('id, amount, created_at, listing_id, listing:listings!listing_id(id, title, current_highest_bid, status, bid_ends_at, seller_id)')
      .eq('bidder_id', user.id)
      .order('created_at', { ascending: false })

    if (myBids) {
      // Group by listing — find my highest bid per listing
      const byListing = new Map<string, typeof myBids[number]>()
      for (const bid of myBids) {
        const lid = bid.listing_id
        if (!byListing.has(lid) || bid.amount > (byListing.get(lid)!.amount)) {
          byListing.set(lid, bid)
        }
      }
      for (const bid of byListing.values()) {
        const listing = bid.listing as { id: string; title: string; current_highest_bid: number | null; status: string; bid_ends_at: string; seller_id: string } | null
        if (!listing) continue
        if (listing.seller_id === user.id) continue // own listing
        if (listing.status === 'active' && listing.current_highest_bid != null && listing.current_highest_bid > bid.amount) {
          results.push({
            id: `outbid-${bid.listing_id}`,
            type: 'outbid',
            title: listing.title,
            detail: `You've been outbid. Current: $${listing.current_highest_bid}`,
            listingId: listing.id,
            timestamp: bid.created_at,
          })
        }
        // 2. Won: sold listings where current_highest_bid = my highest bid
        if (listing.status === 'sold' && listing.current_highest_bid === bid.amount) {
          results.push({
            id: `won-${bid.listing_id}`,
            type: 'won',
            title: listing.title,
            detail: `You won this auction for $${listing.current_highest_bid}`,
            listingId: listing.id,
            timestamp: bid.created_at,
          })
        }
      }
    }

    // 3. Pickup scheduled: pickups on my listings with status = scheduled
    const { data: pickups } = await supabase
      .from('pickups')
      .select('id, listing_id, scheduled_date, created_at, listing:listings!listing_id(id, title, seller_id)')
      .eq('status', 'scheduled')

    if (pickups) {
      for (const p of pickups) {
        const listing = p.listing as { id: string; title: string; seller_id: string } | null
        if (!listing || listing.seller_id !== user.id) continue
        results.push({
          id: `pickup-${p.listing_id}`,
          type: 'pickup_scheduled',
          title: listing.title,
          detail: p.scheduled_date
            ? `Pickup scheduled for ${new Date(p.scheduled_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`
            : 'Pickup has been scheduled',
          listingId: listing.id,
          timestamp: p.created_at,
        })
      }
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setNotifs(results)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) fetchNotifs()
    else setNotifs([])
  }, [user, fetchNotifs])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const lastChecked = getLastChecked()
  const unread = notifs.filter(n => new Date(n.timestamp).getTime() > lastChecked).length

  function handleOpen() {
    if (!open) fetchNotifs()
    setOpen(o => !o)
    markChecked()
  }

  const ICONS: Record<NotifType, typeof Bell> = {
    outbid:           TrendingDown,
    won:              Trophy,
    pickup_scheduled: Package,
  }

  const TYPE_LABELS: Record<NotifType, string> = {
    outbid:           'Outbid',
    won:              'Auction won',
    pickup_scheduled: 'Pickup scheduled',
  }

  if (!user) return null

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={styles.bell}
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {unread > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown} role="dialog" aria-label="Notifications">
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {notifs.length > 0 && (
              <span className={styles.dropdownCount}>{notifs.length}</span>
            )}
          </div>

          <div className={styles.list}>
            {loading && (
              <div className={styles.empty}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            )}
            {!loading && notifs.length === 0 && (
              <div className={styles.empty}>
                <Bell size={20} className={styles.emptyIcon} aria-hidden="true" />
                <p className={styles.emptyText}>No notifications yet</p>
              </div>
            )}
            {!loading && notifs.map(n => {
              const Icon = ICONS[n.type]
              const isNew = new Date(n.timestamp).getTime() > lastChecked
              return (
                <Link
                  key={n.id}
                  to={`/listings/${n.listingId}`}
                  className={`${styles.notif} ${isNew ? styles.notifNew : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <div className={`${styles.notifIcon} ${styles[n.type]}`}>
                    <Icon size={14} aria-hidden="true" />
                  </div>
                  <div className={styles.notifBody}>
                    <p className={styles.notifType}>{TYPE_LABELS[n.type]}</p>
                    <p className={styles.notifTitle}>{n.title}</p>
                    <p className={styles.notifDetail}>{n.detail}</p>
                  </div>
                  <span className={styles.notifTime}>{formatTimeAgo(n.timestamp)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
