const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

export function formatPickupDays(days: string[]): string {
  return days.map(d => DAY_LABELS[d] ?? d).join(', ')
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTimeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days >= 2)  return `${days} days left`
  if (days === 1) return hours > 0 ? `1 day ${hours}h left` : '1 day left'
  if (hours > 0)  return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

export function formatTimeAgo(timestamp: string): string {
  const diff    = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(minutes / 60)
  const days    = Math.floor(hours / 24)
  if (days > 0)    return `${days}d ago`
  if (hours > 0)   return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
