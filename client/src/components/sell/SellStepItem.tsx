import Input from '../ui/Input'
import PhotoUploader from './PhotoUploader'
import { CATEGORIES, SIZES, CONDITION_LABELS } from '../../constants/listings'
import type { ItemCondition } from '../../types'
import type { SellFormState, StepErrors } from './types'
import styles from './SellStepItem.module.css'

interface SellStepItemProps {
  form: SellFormState
  errors: StepErrors
  onChange: (patch: Partial<SellFormState>) => void
  hidePrice?: boolean
}

const CONDITIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
  value: value as ItemCondition, label,
}))

export default function SellStepItem({ form, errors, onChange, hidePrice = false }: SellStepItemProps) {
  return (
    <div className={styles.fields}>
      {/* Photos */}
      <div className={styles.field}>
        <p className={styles.label}>Photos <span className={styles.optional}>(optional, up to 5)</span></p>
        <PhotoUploader
          photos={form.photos}
          onChange={photos => onChange({ photos })}
        />
      </div>

      {/* Title */}
      <Input
        label="Title"
        name="title"
        required
        value={form.title}
        onChange={e => onChange({ title: e.target.value })}
        placeholder="e.g. Vintage Levi's Denim Jacket"
        error={errors.title}
      />

      {/* Description */}
      <Input
        as="textarea"
        label="Description"
        name="description"
        rows={3}
        value={form.description}
        onChange={e => onChange({ description: e.target.value })}
        placeholder="Describe the item: brand, fit, any flaws..."
        hint="Optional but helps buyers."
      />

      {/* Category + Size */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Category <span className={styles.required}>*</span>
          </label>
          <select
            id="category"
            className={`${styles.select} ${errors.category ? styles.selectError : ''}`}
            value={form.category}
            onChange={e => onChange({ category: e.target.value as SellFormState['category'] })}
            aria-invalid={errors.category ? 'true' : undefined}
          >
            <option value="">Select category</option>
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.category && <span className={styles.error}>{errors.category}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="size" className={styles.label}>
            Size <span className={styles.required}>*</span>
          </label>
          <select
            id="size"
            className={`${styles.select} ${errors.size ? styles.selectError : ''}`}
            value={form.size}
            onChange={e => onChange({ size: e.target.value })}
            aria-invalid={errors.size ? 'true' : undefined}
          >
            <option value="">Select size</option>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.size && <span className={styles.error}>{errors.size}</span>}
        </div>
      </div>

      {/* Condition */}
      <div className={styles.field}>
        <p className={`${styles.label} ${errors.condition ? styles.labelError : ''}`}>
          Condition <span className={styles.required}>*</span>
        </p>
        <div className={styles.conditionGrid} role="group" aria-label="Item condition">
          {CONDITIONS.map(({ value, label }) => (
            <label
              key={value}
              className={`${styles.conditionOption} ${form.condition === value ? styles.conditionSelected : ''}`}
            >
              <input
                type="radio"
                name="condition"
                value={value}
                checked={form.condition === value}
                onChange={() => onChange({ condition: value })}
                className={styles.hiddenRadio}
              />
              {label}
            </label>
          ))}
        </div>
        {errors.condition && <span className={styles.error}>{errors.condition}</span>}
      </div>

      {/* Starting price */}
      {!hidePrice && (
        <div className={styles.field}>
          <label htmlFor="startingPrice" className={styles.label}>
            Starting price <span className={styles.optional}>(CA$, 0 = any bid wins)</span>
          </label>
          <div className={styles.priceWrap}>
            <span className={styles.currency}>CA$</span>
            <input
              id="startingPrice"
              type="number"
              min="0"
              step="1"
              className={styles.priceInput}
              value={form.startingPrice}
              onChange={e => onChange({ startingPrice: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
