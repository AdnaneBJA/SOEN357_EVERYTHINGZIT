import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, CalendarCheck, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Pickup, Listing, Charity } from '../types'
import { CHARITIES } from '../constants/charities'
import { CATEGORY_LABELS, CONDITION_LABELS } from '../constants/listings'
import { formatTimeAgo } from '../lib/utils'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import PageWrapper from '../components/layout/PageWrapper'
import styles from './CharityDashboard.module.css'

type Tab = 'pending' | 'scheduled' | 'collected'

type PickupRow = Pickup & {
  listing: Listing & {
    seller: { display_name: string | null } | null
  } | null
}

const TABS: { key: Tab; label: string; Icon: typeof Package }[] = [
  { key: 'pending',   label: 'Pending',   Icon: Package },
  { key: 'scheduled', label: 'Scheduled', Icon: CalendarCheck },
  { key: 'collected', label: 'Collected', Icon: CheckCircle },
]

export default function CharityDashboard() {
  const { addToast } = useToast()

  const [charityId, setCharityId] = useState(CHARITIES[0].id)
  const [tab, setTab]             = useState<Tab>('pending')
  const [pickups, setPickups]     = useState<PickupRow[]>([])
  const [loading, setLoading]     = useState(true)

  // Schedule modal state
  const [scheduling, setScheduling]     = useState<string | null>(null) // pickup id
  const [scheduleDate, setScheduleDate] = useState('')
  const [saving, setSaving]             = useState(false)

  const selectedCharity = CHARITIES.find(c => c.id === charityId) as Charity

  useEffect(() => {
    fetchPickups()
  }, [charityId, tab])

  async function fetchPickups() {
    setLoading(true)
    const { data, error } = await supabase
      .from('pickups')
      .select(`
        id, listing_id, charity_id, status, scheduled_date, collected_at, created_at,
        listing:listings!listing_id(
          id, title, description, category, size, condition,
          photo_urls, status, seller_id, created_at,
          seller:profiles!seller_id(display_name)
        )
      `)
      .eq('charity_id', charityId)
      .eq('status', tab)
      .order('created_at', { ascending: false })

    if (!error && data) setPickups(data as unknown as PickupRow[])
    setLoading(false)
  }

  async function schedulePickup(pickupId: string) {
    if (!scheduleDate) {
      addToast('Please select a date.', 'warning')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('pickups')
      .update({ status: 'scheduled', scheduled_date: scheduleDate })
      .eq('id', pickupId)

    setSaving(false)
    if (error) {
      addToast(error.message, 'error')
    } else {
      addToast('Pickup scheduled.', 'success')
      setScheduling(null)
      setScheduleDate('')
      fetchPickups()
    }
  }

  async function markCollected(pickupId: string) {
    setSaving(true)
    const { error } = await supabase
      .from('pickups')
      .update({ status: 'collected', collected_at: new Date().toISOString() })
      .eq('id', pickupId)

    setSaving(false)
    if (error) {
      addToast(error.message, 'error')
    } else {
      addToast('Item marked as collected.', 'success')
      fetchPickups()
    }
  }

  const counts = TABS.map(t => t.key) // re-fetch counts separately if needed

  return (
    <PageWrapper>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Charity Dashboard</h1>
          <p className={styles.subtitle}>Manage incoming donations and pickups.</p>
        </div>

        {/* Charity selector */}
        <div className={styles.charitySelect}>
          <label htmlFor="charity-select" className={styles.charitySelectLabel}>Viewing:</label>
          <select
            id="charity-select"
            className={styles.select}
            value={charityId}
            onChange={e => { setCharityId(e.target.value); setTab('pending') }}
          >
            {CHARITIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charity info strip */}
      <div className={styles.charityStrip}>
        <div className={styles.charityLogo}>{selectedCharity.name.slice(0, 2).toUpperCase()}</div>
        <div className={styles.charityMeta}>
          <p className={styles.charityName}>{selectedCharity.name}</p>
          <p className={styles.charityCity}>{selectedCharity.city}</p>
        </div>
        <div className={styles.pickupDays}>
          <Clock size={13} aria-hidden="true" />
          {selectedCharity.pickup_days
            .map(d => d.charAt(0).toUpperCase() + d.slice(1))
            .join(' · ')}
        </div>
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
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.skeletons}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : pickups.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No {tab} pickups</p>
          <p className={styles.emptyDesc}>
            {tab === 'pending'   && 'New donations will appear here when sellers list items for this charity.'}
            {tab === 'scheduled' && 'Scheduled pickups will appear here once you schedule pending items.'}
            {tab === 'collected' && 'Collected items will be archived here.'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {pickups.map(pickup => {
            const listing = pickup.listing
            if (!listing) return null
            const hasPhoto = listing.photo_urls.length > 0
            const isSchedulingThis = scheduling === pickup.id

            return (
              <div key={pickup.id} className={styles.card}>
                {/* Photo */}
                <div className={styles.cardPhoto}>
                  {hasPhoto ? (
                    <img src={listing.photo_urls[0]} alt={listing.title} className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardPhotoPlaceholder} aria-hidden="true">
                      {listing.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.cardTitle}>{listing.title}</h3>
                      <div className={styles.cardMeta}>
                        <span>{CATEGORY_LABELS[listing.category]}</span>
                        <span className={styles.metaDot} />
                        <span>Size {listing.size}</span>
                        <span className={styles.metaDot} />
                        <span>{CONDITION_LABELS[listing.condition]}</span>
                      </div>
                      <p className={styles.cardSeller}>
                        From {listing.seller?.display_name ?? 'Anonymous'} · {formatTimeAgo(listing.created_at)}
                      </p>
                    </div>

                    <Link
                      to={`/listings/${listing.id}`}
                      className={styles.viewLink}
                      aria-label={`View listing: ${listing.title}`}
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                    </Link>
                  </div>

                  {/* Scheduled date */}
                  {tab === 'scheduled' && pickup.scheduled_date && (
                    <p className={styles.scheduledDate}>
                      Scheduled for{' '}
                      <strong>
                        {new Date(pickup.scheduled_date).toLocaleDateString('en-CA', {
                          weekday: 'long', month: 'long', day: 'numeric',
                        })}
                      </strong>
                    </p>
                  )}

                  {tab === 'collected' && pickup.collected_at && (
                    <p className={styles.scheduledDate}>
                      Collected {formatTimeAgo(pickup.collected_at)}
                    </p>
                  )}

                  {/* Actions */}
                  {tab === 'pending' && (
                    <div className={styles.actions}>
                      {isSchedulingThis ? (
                        <div className={styles.scheduleForm}>
                          <input
                            type="date"
                            className={styles.dateInput}
                            value={scheduleDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setScheduleDate(e.target.value)}
                            aria-label="Pickup date"
                          />
                          <Button
                            size="sm"
                            loading={saving}
                            onClick={() => schedulePickup(pickup.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setScheduling(null); setScheduleDate('') }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setScheduling(pickup.id)}
                        >
                          <CalendarCheck size={14} aria-hidden="true" />
                          Schedule pickup
                        </Button>
                      )}
                    </div>
                  )}

                  {tab === 'scheduled' && (
                    <div className={styles.actions}>
                      <Button
                        size="sm"
                        loading={saving}
                        onClick={() => markCollected(pickup.id)}
                      >
                        <CheckCircle size={14} aria-hidden="true" />
                        Mark as collected
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
