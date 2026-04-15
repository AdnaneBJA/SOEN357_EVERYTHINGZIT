import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ListingPreview } from '../types'
import PageWrapper from '../components/layout/PageWrapper'
import ListingCard from '../components/listings/ListingCard'
import ListingFilters, { type Filters } from '../components/listings/ListingFilters'
import styles from './Browse.module.css'

const DEFAULT_FILTERS: Filters = { category: '', condition: '', sort: 'newest' }

export default function Browse() {
  const [listings, setListings]   = useState<ListingPreview[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filters, setFilters]     = useState<Filters>(DEFAULT_FILTERS)

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, title, category, size, condition, photo_urls,
        starting_price, current_highest_bid, bid_ends_at, status,
        seller_id, charity_id, description, pickup_day, pickup_time_window, created_at,
        seller:profiles!seller_id(id, display_name, avatar_url),
        charity:charities!charity_id(id, name, logo_url, city)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data as unknown as ListingPreview[])
    }
    setLoading(false)
  }

  const filtered = useMemo(() => {
    let result = listings

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      )
    }

    if (filters.category) {
      result = result.filter(l => l.category === filters.category)
    }

    if (filters.condition) {
      result = result.filter(l => l.condition === filters.condition)
    }

    switch (filters.sort) {
      case 'ending_soon':
        result = [...result].sort((a, b) =>
          new Date(a.bid_ends_at).getTime() - new Date(b.bid_ends_at).getTime()
        )
        break
      case 'price_asc':
        result = [...result].sort((a, b) =>
          (a.current_highest_bid ?? a.starting_price) - (b.current_highest_bid ?? b.starting_price)
        )
        break
      case 'price_desc':
        result = [...result].sort((a, b) =>
          (b.current_highest_bid ?? b.starting_price) - (a.current_highest_bid ?? a.starting_price)
        )
        break
      default: // newest - already sorted by created_at desc from DB
        break
    }

    return result
  }, [listings, search, filters])

  return (
    <PageWrapper>
      <div className={styles.header}>
        <h1 className={styles.title}>Browse listings</h1>
        <p className={styles.subtitle}>Every bid benefits a local charity.</p>
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search listings..."
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search listings"
          />
        </div>
      </div>

      {/* Filters */}
      <ListingFilters filters={filters} onChange={setFilters} total={filtered.length} />

      {/* Grid */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} aria-hidden="true" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No listings found</p>
          <p className={styles.emptyDesc}>
            {search || filters.category || filters.condition
              ? 'Try adjusting your filters or search.'
              : 'No active auctions right now. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
