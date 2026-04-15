import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  SELL_FORM_DEFAULT,
  validateStep1, validateStep2,
  type SellFormState, type StepErrors,
} from '../components/sell/types'
import SellStepItem from '../components/sell/SellStepItem'
import SellStepCharity from '../components/sell/SellStepCharity'
import DonateStepReview from '../components/sell/DonateStepReview'
import Button from '../components/ui/Button'
import PageWrapper from '../components/layout/PageWrapper'
import styles from './Sell.module.css'

const STEPS = ['Item details', 'Charity & pickup', 'Review & donate']

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

export default function Donate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [step, setStep]           = useState(0)
  const [form, setForm]           = useState<SellFormState>(SELL_FORM_DEFAULT)
  const [errors, setErrors]       = useState<StepErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function patch(p: Partial<SellFormState>) {
    setForm(prev => ({ ...prev, ...p }))
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

      const { data: listingId, error } = await supabase.rpc('submit_donation', {
        p_charity_id:         form.charityId,
        p_title:              form.title.trim(),
        p_description:        form.description.trim(),
        p_category:           form.category,
        p_size:               form.size,
        p_condition:          form.condition,
        p_photo_urls:         photoUrls,
        p_pickup_day:         form.dropOff ? null : (form.pickupDay || null),
        p_pickup_time_window: form.dropOff ? null : (form.pickupTimeWindow || null),
      })

      if (error) throw error
      addToast('Donation submitted! Thank you.', 'success')
      navigate(`/listings/${listingId}`)
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
          {step === 0 && 'Describe the item you want to donate.'}
          {step === 1 && 'Choose a charity and arrange pickup.'}
          {step === 2 && 'Review your donation before submitting.'}
        </p>
      </div>

      {/* Step content */}
      <div className={styles.content}>
        {step === 0 && (
          <SellStepItem form={form} errors={errors} onChange={patch} hidePrice />
        )}
        {step === 1 && <SellStepCharity form={form} errors={errors} onChange={patch} />}
        {step === 2 && <DonateStepReview form={form} />}
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
            Confirm donation
          </Button>
        )}
      </div>
    </PageWrapper>
  )
}
