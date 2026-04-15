import type { Charity } from '../types'

export const CHARITIES: Charity[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Moisson Montreal',              description: 'A major food bank that collects and redistributes food to community organizations helping people in need across Montreal.',    logo_url: null, city: 'Montreal',    pickup_days: ['monday','wednesday','friday'],  is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Le Chainon',                    description: 'Supports women in vulnerable situations by providing shelter, meals, and reintegration programs.',                              logo_url: null, city: 'Montreal',    pickup_days: ['tuesday','thursday'],           is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sun Youth Organization',        description: 'Provides emergency food assistance, clothing, and services for youth and families in need.',                                    logo_url: null, city: 'Montreal',    pickup_days: ['monday','thursday','saturday'], is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Moisson Quebec',                description: 'Distributes food to a network of local organizations to fight hunger in the Quebec City region.',                              logo_url: null, city: 'Quebec City', pickup_days: ['tuesday','friday'],             is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Dans la rue',                   description: 'Helps homeless and at-risk youth with shelter, food, and social support services.',                                             logo_url: null, city: 'Montreal',    pickup_days: ['wednesday','saturday'],         is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Renaissance Goodwill Montreal', description: 'Collects donations of clothing and goods to fund job integration programs for people facing barriers to employment.',          logo_url: null, city: 'Montreal',    pickup_days: ['monday','tuesday','friday'],    is_active: true, created_at: '2024-01-01T00:00:00Z' },
]

export const CHARITY_MAP = Object.fromEntries(CHARITIES.map(c => [c.id, c])) as Record<string, Charity>
