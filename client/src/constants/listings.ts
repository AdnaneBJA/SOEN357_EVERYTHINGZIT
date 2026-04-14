import type { ItemCategory, ItemCondition } from '../types'

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  tops: 'Tops', bottoms: 'Bottoms', dresses: 'Dresses', outerwear: 'Outerwear',
  shoes: 'Shoes', accessories: 'Accessories', bags: 'Bags', other: 'Other',
}

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  new_with_tags: 'New with tags', like_new: 'Like new', good: 'Good', fair: 'Fair',
}

export const SIZES = [
  'XS','S','M','L','XL','XXL','One Size',
  '36','37','38','39','40','41','42','43','44','45',
]

export const CATEGORIES = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ItemCategory, label })
)
