import { SlidersHorizontal } from 'lucide-react'
import type { ItemCategory, ItemCondition } from '../../types'
import { CATEGORIES, CONDITION_LABELS } from '../../constants/listings'
import styles from './ListingFilters.module.css'

export type SortOption = 'newest' | 'ending_soon' | 'price_asc' | 'price_desc'

export interface Filters {
  category: ItemCategory | ''
  condition: ItemCondition | ''
  sort: SortOption
}

interface ListingFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  total: number
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',      label: 'Newest first' },
  { value: 'ending_soon', label: 'Ending soon' },
  { value: 'price_asc',   label: 'Price: low to high' },
  { value: 'price_desc',  label: 'Price: high to low' },
]

const CONDITIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
  value: value as ItemCondition,
  label,
}))

export default function ListingFilters({ filters, onChange, total }: ListingFiltersProps) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <SlidersHorizontal size={15} className={styles.icon} aria-hidden="true" />
        <span className={styles.count}>{total} listing{total !== 1 ? 's' : ''}</span>

        {/* Category pills */}
        <div className={styles.pills} role="group" aria-label="Filter by category">
          <button
            className={`${styles.pill} ${filters.category === '' ? styles.pillActive : ''}`}
            onClick={() => set('category', '')}
          >
            All
          </button>
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.pill} ${filters.category === value ? styles.pillActive : ''}`}
              onClick={() => set('category', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        {/* Condition */}
        <select
          className={styles.select}
          value={filters.condition}
          onChange={e => set('condition', e.target.value as ItemCondition | '')}
          aria-label="Filter by condition"
        >
          <option value="">All conditions</option>
          {CONDITIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className={styles.select}
          value={filters.sort}
          onChange={e => set('sort', e.target.value as SortOption)}
          aria-label="Sort listings"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
