import { Tag, Heart, Package } from 'lucide-react'
import type { SellFormState } from './types'
import { CATEGORY_LABELS, CONDITION_LABELS } from '../../constants/listings'
import { CHARITY_MAP } from '../../constants/charities'
import styles from './SellStepReview.module.css'

interface DonateStepReviewProps {
  form: SellFormState
}

export default function DonateStepReview({ form }: DonateStepReviewProps) {
  const charity = form.charityId ? CHARITY_MAP[form.charityId] : null
  const coverUrl = form.photos[0] ? URL.createObjectURL(form.photos[0]) : null

  return (
    <div className={styles.review}>
      {/* Photo preview */}
      <div className={styles.photoPreview}>
        {coverUrl ? (
          <img src={coverUrl} alt="Cover photo" className={styles.coverImg} />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden="true">
            <Tag size={28} className={styles.placeholderIcon} />
          </div>
        )}
        {form.photos.length > 1 && (
          <span className={styles.photoCount}>+{form.photos.length - 1} more</span>
        )}
      </div>

      {/* Item details */}
      <div className={styles.section}>
        <div className={styles.sectionIcon}>
          <Tag size={14} aria-hidden="true" />
        </div>
        <div className={styles.sectionContent}>
          <p className={styles.sectionLabel}>Item</p>
          <h3 className={styles.itemTitle}>{form.title || '—'}</h3>
          {form.description && (
            <p className={styles.itemDesc}>{form.description}</p>
          )}
          <div className={styles.tags}>
            {form.category && (
              <span className={styles.tag}>{CATEGORY_LABELS[form.category]}</span>
            )}
            {form.size && <span className={styles.tag}>Size {form.size}</span>}
            {form.condition && (
              <span className={styles.tag}>{CONDITION_LABELS[form.condition]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Charity */}
      <div className={styles.section}>
        <div className={styles.sectionIcon}>
          <Heart size={14} aria-hidden="true" />
        </div>
        <div className={styles.sectionContent}>
          <p className={styles.sectionLabel}>Donating to</p>
          {charity ? (
            <>
              <p className={styles.detail}><strong>{charity.name}</strong></p>
              <p className={styles.detail}>{charity.city}</p>
            </>
          ) : (
            <p className={styles.detail}>—</p>
          )}
        </div>
      </div>

      {/* Pickup */}
      <div className={styles.section}>
        <div className={styles.sectionIcon}>
          <Package size={14} aria-hidden="true" />
        </div>
        <div className={styles.sectionContent}>
          <p className={styles.sectionLabel}>Pickup</p>
          {form.dropOff ? (
            <p className={styles.detail}>Drop-off by donor</p>
          ) : form.pickupDay ? (
            <>
              <p className={styles.detail}>
                <strong>{form.pickupDay.charAt(0).toUpperCase() + form.pickupDay.slice(1)}</strong>
              </p>
              {form.pickupTimeWindow && (
                <p className={styles.detail}>{form.pickupTimeWindow}</p>
              )}
            </>
          ) : (
            <p className={styles.detail}>—</p>
          )}
        </div>
      </div>
    </div>
  )
}
