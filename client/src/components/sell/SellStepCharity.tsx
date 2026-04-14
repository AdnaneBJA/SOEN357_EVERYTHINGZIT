import { MapPin, Clock, Truck } from 'lucide-react'
import { CHARITIES } from '../../constants/charities'
import { formatPickupDays } from '../../lib/utils'
import type { SellFormState, StepErrors } from './types'
import { TIME_WINDOWS } from './types'
import styles from './SellStepCharity.module.css'

interface SellStepCharityProps {
  form: SellFormState
  errors: StepErrors
  onChange: (patch: Partial<SellFormState>) => void
}

export default function SellStepCharity({ form, errors, onChange }: SellStepCharityProps) {
  const selectedCharity = CHARITIES.find(c => c.id === form.charityId)

  return (
    <div className={styles.fields}>
      {/* Charity selection */}
      <div className={styles.field}>
        <p className={`${styles.label} ${errors.charityId ? styles.labelError : ''}`}>
          Choose a charity <span className={styles.required}>*</span>
        </p>
        <div className={styles.charityGrid} role="group" aria-label="Select charity">
          {CHARITIES.map(charity => (
            <label
              key={charity.id}
              className={`${styles.charityCard} ${form.charityId === charity.id ? styles.charitySelected : ''}`}
            >
              <input
                type="radio"
                name="charityId"
                value={charity.id}
                checked={form.charityId === charity.id}
                onChange={() => onChange({ charityId: charity.id, pickupDay: '', pickupTimeWindow: '' })}
                className={styles.hiddenRadio}
              />
              <div className={styles.charityLogo}>
                {charity.name.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.charityInfo}>
                <p className={styles.charityName}>{charity.name}</p>
                <p className={styles.charityCity}>
                  <MapPin size={11} aria-hidden="true" /> {charity.city}
                </p>
              </div>
            </label>
          ))}
        </div>
        {errors.charityId && <span className={styles.error}>{errors.charityId}</span>}
      </div>

      {/* Pickup scheduling — only shown after charity selected */}
      {selectedCharity && (
        <div className={styles.pickupSection}>
          <div className={styles.pickupHeader}>
            <Truck size={15} aria-hidden="true" />
            <p className={styles.label}>Pickup or drop-off</p>
          </div>

          {/* Drop-off toggle */}
          <label className={`${styles.dropOffCard} ${form.dropOff ? styles.dropOffSelected : ''}`}>
            <input
              type="checkbox"
              checked={form.dropOff}
              onChange={e => onChange({ dropOff: e.target.checked, pickupDay: '', pickupTimeWindow: '' })}
              className={styles.hiddenRadio}
            />
            <div className={styles.dropOffText}>
              <span className={styles.dropOffTitle}>I will drop it off</span>
              <span className={styles.dropOffDesc}>Skip scheduling — bring the item to the charity yourself.</span>
            </div>
          </label>

          {!form.dropOff && (
            <div className={styles.scheduleFields}>
              <p className={styles.pickupNote}>
                {selectedCharity.name} picks up on:{' '}
                <strong>{formatPickupDays(selectedCharity.pickup_days)}</strong>
              </p>

              {/* Pickup day */}
              <div className={styles.field}>
                <p className={`${styles.label} ${errors.pickupDay ? styles.labelError : ''}`}>
                  Pickup day <span className={styles.required}>*</span>
                </p>
                <div className={styles.dayGrid} role="group" aria-label="Pickup day">
                  {selectedCharity.pickup_days.map(day => (
                    <label
                      key={day}
                      className={`${styles.dayOption} ${form.pickupDay === day ? styles.daySelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="pickupDay"
                        value={day}
                        checked={form.pickupDay === day}
                        onChange={() => onChange({ pickupDay: day })}
                        className={styles.hiddenRadio}
                      />
                      <Clock size={12} aria-hidden="true" />
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                  ))}
                </div>
                {errors.pickupDay && <span className={styles.error}>{errors.pickupDay}</span>}
              </div>

              {/* Time window */}
              {form.pickupDay && (
                <div className={styles.field}>
                  <p className={styles.label}>Time window <span className={styles.optional}>(optional)</span></p>
                  <div className={styles.timeGrid} role="group" aria-label="Pickup time window">
                    {TIME_WINDOWS.map(({ value, label }) => (
                      <label
                        key={value}
                        className={`${styles.dayOption} ${form.pickupTimeWindow === value ? styles.daySelected : ''}`}
                      >
                        <input
                          type="radio"
                          name="pickupTimeWindow"
                          value={value}
                          checked={form.pickupTimeWindow === value}
                          onChange={() => onChange({ pickupTimeWindow: value })}
                          className={styles.hiddenRadio}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
