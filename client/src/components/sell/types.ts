import type { ItemCategory, ItemCondition } from '../../types'

export interface SellFormState {
  photos: File[]; title: string; description: string
  category: ItemCategory | ''; size: string; condition: ItemCondition | ''
  startingPrice: string; charityId: string
  pickupDay: string; pickupTimeWindow: string; dropOff: boolean
}

export const SELL_FORM_DEFAULT: SellFormState = {
  photos: [], title: '', description: '', category: '', size: '', condition: '',
  startingPrice: '0', charityId: '', pickupDay: '', pickupTimeWindow: '', dropOff: false,
}

export const TIME_WINDOWS = [
  { value: '9:00 - 12:00',  label: 'Morning (9–12)' },
  { value: '12:00 - 17:00', label: 'Afternoon (12–5)' },
  { value: '17:00 - 20:00', label: 'Evening (5–8)' },
]

export const AUCTION_DURATION_MS = 2 * 60 * 60 * 1000 // 2 hours

export type StepErrors = Partial<Record<keyof SellFormState, string>>

export function validateStep1(f: SellFormState): StepErrors {
  const e: StepErrors = {}
  if (!f.title.trim()) e.title = 'Title is required'
  if (!f.category)     e.category = 'Category is required'
  if (!f.size)         e.size = 'Size is required'
  if (!f.condition)    e.condition = 'Condition is required'
  return e
}

export function validateStep2(f: SellFormState): StepErrors {
  const e: StepErrors = {}
  if (!f.charityId) e.charityId = 'Please select a charity'
  if (!f.dropOff && !f.pickupDay) e.pickupDay = 'Select a pickup day or choose drop-off'
  return e
}
