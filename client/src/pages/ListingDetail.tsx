import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ListingWithDetails, Pickup, Charity } from '../types'
import { CATEGORY_LABELS, CONDITION_LABELS } from '../constants/listings'
import { formatTimeAgo, getInitials } from '../lib/utils'
import PageWrapper from '../components/layout/PageWrapper'
import BidSection from '../components/listings/BidSection'
import BidHistory from '../components/listings/BidHistory'
import CharityInfoCard from '../components/listings/CharityInfoCard'
import PickupTracker from '../components/listings/PickupTracker'
import styles from './ListingDetail.module.css'

type FullListing = ListingWithDetails & { charity: Charity }

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing]   = useState<FullListing | null>(null)
  const [pickup, setPickup]     = useState<Pickup | null>(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchListing = useCallback(async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, title, description, category, size, condition, photo_urls,
        starting_price, current_highest_bid, bid_ends_at, status,
        seller_id, created_at, pickup_day, pickup_time_window, charity_id,
        seller:profiles!seller_id(id, display_name, avatar_url),
        charity:charities!charity_id(id, name, logo_url, city, pickup_days, description, is_active, created_at),
        bids(id, amount, bidder_id, created_at, bidder:profiles!bidder_id(display_name))
      `)
      .eq('id', id)
      .single()

    if (error || !data) { setNotFound(true); setLoading(false); return }
    setListing(data as unknown as FullListing)
    setLoading(false)

    // Fetch pickup record if finalized
    if (data.status !== 'active') {
      const { data: pickupData } = await supabase
        .from('pickups')
        .select('*')
        .eq('listing_id', id)
        .single()
      setPickup(pickupData)
    }
  }, [id])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  // Realtime bids subscription
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`bids:listing:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `listing_id=eq.${id}` },
        () => { fetchListing() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, fetchListing])

  async function handleExpire() {
    if (!id) return
    await supabase.rpc('finalize_listing', { p_listing_id: id })
    fetchListing()
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className={styles.skeleton}>
          <div className={styles.skeletonPhoto} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '60%', height: '28px' }} />
            <div className={styles.skeletonLine} style={{ width: '40%', height: '18px' }} />
            <div className={styles.skeletonLine} style={{ width: '100%', height: '100px' }} />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (notFound || !listing) {
    return (
      <PageWrapper>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Listing not found</h1>
          <Link to="/browse" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to browse
          </Link>
        </div>
      </PageWrapper>
    )
  }

  const seller = listing.seller as { id: string; display_name: string | null; avatar_url: string | null }
  const photos = listing.photo_urls
  const hasPhotos = photos.length > 0

  return (
    <PageWrapper>
      {/* Back nav */}
      <Link to="/browse" className={styles.backLink}>
        <ArrowLeft size={15} aria-hidden="true" />
        All listings
      </Link>

      <div className={styles.layout}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Photo gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainPhoto}>
              {hasPhotos ? (
                <img
                  src={photos[photoIdx]}
                  alt={listing.title}
                  className={styles.mainImg}
                />
              ) : (
                <div className={styles.photoPlaceholder} aria-hidden="true">
                  <span className={styles.placeholderInitial}>
                    {listing.title.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className={styles.thumbnails}>
                {photos.map((url, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === photoIdx ? styles.thumbActive : ''}`}
                    onClick={() => setPhotoIdx(i)}
                    aria-label={`Photo ${i + 1}`}
                  >
                    <img src={url} alt="" className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item info */}
          <div className={styles.info}>
            <div className={styles.metaRow}>
              <span className={styles.category}>{CATEGORY_LABELS[listing.category]}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.size}>Size {listing.size}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.condition}>{CONDITION_LABELS[listing.condition]}</span>
            </div>
            <h1 className={styles.title}>{listing.title}</h1>
            <p className={styles.description}>{listing.description}</p>

            {/* Seller */}
            <div className={styles.seller}>
              <div className={styles.sellerAvatar} aria-hidden="true">
                {getInitials(seller.display_name ?? 'U')}
              </div>
              <div>
                <p className={styles.sellerLabel}>Listed by</p>
                <p className={styles.sellerName}>{seller.display_name ?? 'Anonymous'}</p>
              </div>
              <span className={styles.listedTime}>{formatTimeAgo(listing.created_at)}</span>
            </div>
          </div>

          {/* Bid history */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Bid history</h2>
            <BidHistory bids={listing.bids as Parameters<typeof BidHistory>[0]['bids']} />
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          <BidSection
            listing={listing}
            onBidPlaced={fetchListing}
            onExpire={handleExpire}
          />
          <CharityInfoCard charity={listing.charity} />
          {pickup && listing.status !== 'active' && (
            <PickupTracker pickup={pickup} status={listing.status} />
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
