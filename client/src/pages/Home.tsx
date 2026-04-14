import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Tag, Heart, TrendingUp, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { CHARITIES } from '../constants/charities'
import { formatPickupDays } from '../lib/utils'
import styles from './Home.module.css'

const STATS = [
  { value: '1,200+', label: 'Items listed' },
  { value: '$48K',   label: 'Raised for charity' },
  { value: '6',      label: 'Partner charities' },
  { value: '340+',   label: 'Auctions won' },
]

const STEPS = [
  {
    number: '01',
    Icon: Tag,
    title: 'List your item',
    desc: 'Upload photos, add a description, set a starting price. Takes under 2 minutes.',
  },
  {
    number: '02',
    Icon: Heart,
    title: 'Pick a charity',
    desc: 'Choose from our partner charities. Every item benefits a local Montreal organization.',
  },
  {
    number: '03',
    Icon: Clock,
    title: '2-hour auction',
    desc: 'Buyers bid for 2 hours. No bids? The item is auto-donated. Either way, the charity wins.',
  },
]

// Use the first two charities for the spotlight grid
const SPOTLIGHT = CHARITIES.slice(0, 4)

export default function Home() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <TrendingUp size={13} aria-hidden="true" />
            Thrift. Bid. Give back.
          </div>
          <h1 className={styles.heroTitle}>
            Your old clothes,<br />
            <span className={styles.heroAccent}>someone's lifeline.</span>
          </h1>
          <p className={styles.heroDesc}>
            FullCircle connects sellers with local charities through live 2-hour auctions.
            List an item, pick a cause — if it sells, the proceeds go to charity.
            If it doesn't, we donate it anyway.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/browse" className={styles.ctaPrimary}>
              Browse listings
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {user ? (
              <Link to="/sell" className={styles.ctaSecondary}>Start selling</Link>
            ) : (
              <Link to="/signup" className={styles.ctaSecondary}>Join for free</Link>
            )}
          </div>
        </div>

        {/* Mock listing card */}
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.mockCard}>
            <div className={styles.mockPhoto}>
              <div className={styles.mockPhotoInner}>
                <Tag size={28} className={styles.mockIcon} />
              </div>
              <div className={styles.mockBadge}>
                <Clock size={11} />
                1h 42m left
              </div>
            </div>
            <div className={styles.mockBody}>
              <p className={styles.mockCategory}>Outerwear · M</p>
              <p className={styles.mockTitle}>Vintage Wool Overcoat</p>
              <div className={styles.mockFooter}>
                <div>
                  <p className={styles.mockBidLabel}>Current bid</p>
                  <p className={styles.mockBidAmount}>CA$34</p>
                </div>
                <div className={styles.mockCharity}>
                  <Heart size={12} />
                  Le Chainon
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mockCard2}>
            <div className={styles.mockPhoto2}>
              <div className={styles.mockPhotoInner}>
                <Tag size={20} className={styles.mockIcon} />
              </div>
            </div>
            <div className={styles.mock2Body}>
              <p className={styles.mockTitle} style={{ fontSize: '0.8125rem' }}>Linen Summer Dress</p>
              <p className={styles.mockBidAmount} style={{ fontSize: '0.9375rem' }}>CA$12</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.statsInner}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionDesc}>Three steps. Two hours. One good cause.</p>
          </div>
          <div className={styles.steps}>
            {STEPS.map(({ number, Icon, title, desc }) => (
              <div key={number} className={styles.step}>
                <div className={styles.stepNumber}>{number}</div>
                <div className={styles.stepIcon}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity spotlight */}
      <section className={styles.charitySection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our partner charities</h2>
            <p className={styles.sectionDesc}>Every item you list or buy benefits one of these organizations.</p>
          </div>
          <div className={styles.charityGrid}>
            {SPOTLIGHT.map(charity => (
              <div key={charity.id} className={styles.charityCard}>
                <div className={styles.charityLogo}>
                  {charity.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.charityInfo}>
                  <h3 className={styles.charityName}>{charity.name}</h3>
                  <p className={styles.charityDesc}>{charity.description}</p>
                  <div className={styles.charityMeta}>
                    <span className={styles.charityMetaItem}>
                      <MapPin size={12} aria-hidden="true" />
                      {charity.city}
                    </span>
                    <span className={styles.charityMetaItem}>
                      <Clock size={12} aria-hidden="true" />
                      Pickup: {formatPickupDays(charity.pickup_days)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className={styles.ctaStrip}>
        <div className={styles.ctaStripInner}>
          <h2 className={styles.ctaStripTitle}>Ready to make a difference?</h2>
          <p className={styles.ctaStripDesc}>
            List your first item today — it takes 2 minutes and always benefits a local charity.
          </p>
          <div className={styles.ctaStripActions}>
            {user ? (
              <>
                <Link to="/sell" className={styles.ctaStripPrimary}>
                  List an item
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/donate" className={styles.ctaStripGhost}>Donate directly</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className={styles.ctaStripPrimary}>
                  Get started
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/browse" className={styles.ctaStripGhost}>Browse first</Link>
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
