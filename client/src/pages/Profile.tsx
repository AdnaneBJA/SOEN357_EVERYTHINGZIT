import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tag, Gavel, Heart, LogOut, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { Listing, Donation } from '../types'
import { CATEGORY_LABELS, CONDITION_LABELS } from '../constants/listings'
import { CHARITY_MAP } from '../constants/charities'
import { formatPrice, formatTimeAgo, getInitials } from '../lib/utils'
import Button from '../components/ui/Button'
import PageWrapper from '../components/layout/PageWrapper'
import styles from './Profile.module.css'

type Tab = 'listings' | 'bids' | 'donations'

const TABS: { key: Tab; label: string; Icon: typeof Tag }[] = [
  { key: 'listings',  label: 'My listings',  Icon: Tag },
  { key: 'bids',      label: 'My bids',      Icon: Gavel },
  { key: 'donations', label: 'My donations', Icon: Heart },
]

type BidRow = {
  id: string; amount: number; created_at: string
  listing: (Listing & { charity: { name: string; id: string } | null }) | null
}

type DonationRow = Donation & {
  listing: Pick<Listing, 'id' | 'title' | 'category' | 'size' | 'condition' | 'photo_urls' | 'status' | 'created_at'> | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:         { label: 'Live',          color: '#16a34a' },
  sold:           { label: 'Sold',          color: '#2563eb' },
  donated:        { label: 'Auto-donated',  color: '#d97706' },
  direct_donated: { label: 'Donated',       color: '#d97706' },
}

export default function Profile() {
  const { profile, signOut } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [tab, setTab]         = useState<Tab>('listings')
  const [listings, setListings]   = useState<Listing[]>([])
  const [bids, setBids]           = useState<BidRow[]>([])
  const [donations, setDonations] = useState<DonationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!profile) return
    fetchTab(tab)
  }, [tab, profile])

  async function fetchTab(t: Tab) {
    if (!profile) return
    setLoading(true)

    if (t === 'listings') {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
      setListings((data ?? []) as Listing[])
    }

    if (t === 'bids') {
      const { data } = await supabase
        .from('bids')
        .select(`
          id, amount, created_at, listing_id,
          listing:listings!listing_id(
            id, title, category, size, condition, photo_urls,
            current_highest_bid, starting_price, status, bid_ends_at, seller_id, charity_id,
            charity:charities!charity_id(id, name)
          )
        `)
        .eq('bidder_id', profile.id)
        .order('created_at', { ascending: false })
      // Deduplicate — keep only the highest bid per listing
      const seen = new Set<string>()
      const deduped: BidRow[] = []
      for (const row of (data ?? []) as unknown as BidRow[]) {
        const lid = (row.listing as { id: string } | null)?.id ?? ''
        if (!seen.has(lid)) { seen.add(lid); deduped.push(row) }
      }
      setBids(deduped)
    }

    if (t === 'donations') {
      const { data } = await supabase
        .from('donations')
        .select(`
          id, listing_id, charity_id, created_at,
          listing:listings!listing_id(id, title, category, size, condition, photo_urls, status, created_at)
        `)
        .eq('donor_id', profile.id)
        .order('created_at', { ascending: false })
      setDonations((data ?? []) as unknown as DonationRow[])
    }

    setLoading(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    addToast('Signed out.', 'info')
    navigate('/login')
  }

  if (!profile) return null

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long',
  })

  return (
    <PageWrapper>
      {/* Profile card */}
      <div className={styles.profileCard}>
        <div className={styles.avatar} aria-hidden="true">
          {getInitials(profile.display_name ?? profile.email)}
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.displayName}>{profile.display_name ?? 'Anonymous'}</h1>
          <p className={styles.email}>{profile.email}</p>
          <div className={styles.profileMeta}>
            <span className={styles.memberSince}>Member since {joinDate}</span>
            {profile.role === 'charity_rep' && (
              <span className={styles.roleBadge}>
                <ShieldCheck size={12} aria-hidden="true" />
                Charity Rep
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          loading={signingOut}
          className={styles.signOutBtn}
        >
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </Button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className={styles.skeletons}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <>
          {/* Listings */}
          {tab === 'listings' && (
            listings.length === 0 ? (
              <Empty
                Icon={Tag}
                title="No listings yet"
                desc="Items you list for auction will appear here."
                cta={{ to: '/sell', label: 'List your first item' }}
              />
            ) : (
              <div className={styles.list}>
                {listings.map(l => {
                  const status = STATUS_LABELS[l.status] ?? { label: l.status, color: 'var(--color-text-muted)' }
                  const price  = l.current_highest_bid ?? l.starting_price
                  return (
                    <Link key={l.id} to={`/listings/${l.id}`} className={styles.row}>
                      <Thumbnail urls={l.photo_urls} title={l.title} />
                      <div className={styles.rowBody}>
                        <div className={styles.rowTop}>
                          <h3 className={styles.rowTitle}>{l.title}</h3>
                          <span className={styles.rowStatus} style={{ color: status.color }}>{status.label}</span>
                        </div>
                        <p className={styles.rowMeta}>
                          {CATEGORY_LABELS[l.category]} · Size {l.size} · {CONDITION_LABELS[l.condition]}
                        </p>
                        <p className={styles.rowSub}>
                          {l.current_highest_bid ? `Highest bid: ${formatPrice(price)}` : `Starting at ${formatPrice(price)}`}
                          {' · '}{formatTimeAgo(l.created_at)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          )}

          {/* Bids */}
          {tab === 'bids' && (
            bids.length === 0 ? (
              <Empty
                Icon={Gavel}
                title="No bids placed yet"
                desc="Auctions you've bid on will appear here."
                cta={{ to: '/browse', label: 'Browse active listings' }}
              />
            ) : (
              <div className={styles.list}>
                {bids.map(b => {
                  const listing = b.listing
                  if (!listing) return null
                  const isWinning = listing.status === 'active' && listing.current_highest_bid === b.amount
                  const isWon     = listing.status === 'sold'   && listing.current_highest_bid === b.amount
                  const isOutbid  = listing.status === 'active' && listing.current_highest_bid != null && listing.current_highest_bid > b.amount
                  const charity   = listing.charity
                  return (
                    <Link key={b.id} to={`/listings/${listing.id}`} className={styles.row}>
                      <Thumbnail urls={listing.photo_urls} title={listing.title} />
                      <div className={styles.rowBody}>
                        <div className={styles.rowTop}>
                          <h3 className={styles.rowTitle}>{listing.title}</h3>
                          {isWon     && <span className={styles.rowStatus} style={{ color: '#2563eb' }}>Won</span>}
                          {isWinning && <span className={styles.rowStatus} style={{ color: '#16a34a' }}>Winning</span>}
                          {isOutbid  && <span className={styles.rowStatus} style={{ color: 'var(--color-error)' }}>Outbid</span>}
                        </div>
                        <p className={styles.rowMeta}>
                          {CATEGORY_LABELS[listing.category]} · Size {listing.size}
                        </p>
                        <p className={styles.rowSub}>
                          Your bid: <strong>{formatPrice(b.amount)}</strong>
                          {listing.current_highest_bid && listing.current_highest_bid !== b.amount
                            ? ` · Current: ${formatPrice(listing.current_highest_bid)}`
                            : ''}
                          {charity ? ` · ${charity.name}` : ''}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          )}

          {/* Donations */}
          {tab === 'donations' && (
            donations.length === 0 ? (
              <Empty
                Icon={Heart}
                title="No donations yet"
                desc="Items you donate directly will appear here."
                cta={{ to: '/donate', label: 'Make your first donation' }}
              />
            ) : (
              <div className={styles.list}>
                {donations.map(d => {
                  const listing  = d.listing
                  const charity  = CHARITY_MAP[d.charity_id]
                  if (!listing) return null
                  return (
                    <Link key={d.id} to={`/listings/${listing.id}`} className={styles.row}>
                      <Thumbnail urls={listing.photo_urls} title={listing.title} />
                      <div className={styles.rowBody}>
                        <div className={styles.rowTop}>
                          <h3 className={styles.rowTitle}>{listing.title}</h3>
                          <span className={styles.rowStatus} style={{ color: '#d97706' }}>Donated</span>
                        </div>
                        <p className={styles.rowMeta}>
                          {CATEGORY_LABELS[listing.category]} · Size {listing.size} · {CONDITION_LABELS[listing.condition]}
                        </p>
                        <p className={styles.rowSub}>
                          {charity ? `To ${charity.name}` : 'Direct donation'}
                          {' · '}{formatTimeAgo(d.created_at)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          )}
        </>
      )}
    </PageWrapper>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */

function Thumbnail({ urls, title }: { urls: string[]; title: string }) {
  return (
    <div className={styles.thumb}>
      {urls[0] ? (
        <img src={urls[0]} alt={title} className={styles.thumbImg} />
      ) : (
        <div className={styles.thumbPlaceholder} aria-hidden="true">
          {title.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  )
}

function Empty({
  Icon, title, desc, cta,
}: {
  Icon: typeof Tag
  title: string
  desc: string
  cta: { to: string; label: string }
}) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDesc}>{desc}</p>
      <Link to={cta.to} className={styles.emptyCta}>{cta.label}</Link>
    </div>
  )
}
