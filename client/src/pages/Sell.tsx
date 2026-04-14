import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { ItemCategory, ItemCondition } from '../types'
import {
  SELL_FORM_DEFAULT, AUCTION_DURATION_MS,
  validateStep1, validateStep2,
  type SellFormState, type StepErrors,
} from '../components/sell/types'
import SellStepItem from '../components/sell/SellStepItem'
import SellStepCharity from '../components/sell/SellStepCharity'
import SellStepReview from '../components/sell/SellStepReview'
import Button from '../components/ui/Button'
import PageWrapper from '../components/layout/PageWrapper'
import styles from './Sell.module.css'

const STEPS = ['Item details', 'Charity & pickup', 'Review & list']

async function uploadPhotos(photos: File[], userId: string): Promise<string[]> {
  const urls: string[] = []
  for (const photo of photos) {
    const path = `${userId}/${Date.now()}-${photo.name.replace(/\s+/g, '-')}`
    const { data, error } = await supabase.storage.from('listing-photos').upload(path, photo)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(data.path)
    urls.push(publicUrl)
  }
  return urls
}

export default function Sell() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState<SellFormState>(SELL_FORM_DEFAULT)
  const [errors, setErrors]   = useState<StepErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function patch(p: Partial<SellFormState>) {
    setForm(prev => ({ ...prev, ...p }))
    // Clear errors for changed fields
    const cleared = Object.keys(p).reduce((acc, k) => ({ ...acc, [k]: undefined }), {})
    setErrors(prev => ({ ...prev, ...cleared }))
  }

  function goNext() {
    let errs: StepErrors = {}
    if (step === 0) errs = validateStep1(form)
    if (step === 1) errs = validateStep2(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
  }

  function goBack() {
    setErrors({})
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    try {
      const photoUrls = form.photos.length > 0
        ? await uploadPhotos(form.photos, user.id)
        : []

      const bidEndsAt = new Date(Date.now() + AUCTION_DURATION_MS).toISOString()

      const { data, error } = await supabase.from('listings').insert({
        seller_id:    user.id,
        charity_id:   form.charityId,
        title:        form.title.trim(),
        description:  form.description.trim(),
        category:     form.category as ItemCategory,
        size:         form.size,
        condition:    form.condition as ItemCondition,
        photo_urls:   photoUrls,
        starting_price: parseFloat(form.startingPrice) || 0,
        bid_ends_at:  bidEndsAt,
        pickup_day:   form.dropOff ? null : (form.pickupDay || null),
        pickup_time_window: form.dropOff ? null : (form.pickupTimeWindow || null),
      }).select('id').single()

      if (error) throw error
      addToast('Listing created! Auction is live.', 'success')
      navigate(`/listings/${data.id}`)
    } catch (err) {
      addToast((err as Error).message ?? 'Something went wrong.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageWrapper narrow>
      {/* Step indicator */}
      <div className={styles.stepIndicator} aria-label="Progress">
        {STEPS.map((label, i) => (
          <div key={label} className={styles.stepItem}>
            <div className={`${styles.stepDot} ${i < step ? styles.stepDone : ''} ${i === step ? styles.stepActive : ''}`}>
              {i < step ? <Check size={12} aria-hidden="true" /> : i + 1}
            </div>
            <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{label}</span>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Heading */}
      <div className={styles.header}>
        <h1 className={styles.title}>{STEPS[step]}</h1>
        <p className={styles.subtitle}>
          {step === 0 && 'Describe your item and upload photos.'}
          {step === 1 && 'Pick a charity and schedule a pickup.'}
          {step === 2 && 'Review your listing before it goes live.'}
        </p>
      </div>

      {/* Step content */}
      <div className={styles.content}>
        {step === 0 && <SellStepItem form={form} errors={errors} onChange={patch} />}
        {step === 1 && <SellStepCharity form={form} errors={errors} onChange={patch} />}
        {step === 2 && <SellStepReview form={form} mode="sell" />}
      </div>

      {/* Navigation */}
      <div className={styles.nav}>
        {step > 0 ? (
          <Button variant="ghost" onClick={goBack} disabled={submitting}>
            <ChevronLeft size={16} aria-hidden="true" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button onClick={goNext}>
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} variant="primary" size="lg">
            List item — start auction
          </Button>
        )}
      </div>
    </PageWrapper>
  )
}
