import type { Database } from './database'
type Tables = Database['public']['Tables']
type Enums  = Database['public']['Enums']

export type Profile  = Tables['profiles']['Row']
export type Charity  = Tables['charities']['Row']
export type Listing  = Tables['listings']['Row']
export type Bid      = Tables['bids']['Row']
export type Donation = Tables['donations']['Row']
export type Pickup   = Tables['pickups']['Row']

export type InsertProfile  = Tables['profiles']['Insert']
export type InsertListing  = Tables['listings']['Insert']
export type InsertBid      = Tables['bids']['Insert']
export type InsertDonation = Tables['donations']['Insert']
export type InsertPickup   = Tables['pickups']['Insert']

export type UpdateProfile = Tables['profiles']['Update']
export type UpdateListing = Tables['listings']['Update']
export type UpdatePickup  = Tables['pickups']['Update']

export type UserRole      = Enums['user_role']
export type ItemCategory  = Enums['item_category']
export type ItemCondition = Enums['item_condition']
export type ListingStatus = Enums['listing_status']
export type PickupStatus  = Enums['pickup_status']

export type ItemSize =
  | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size'
  | '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45'

export type ListingPreview = Listing & {
  seller: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
  charity: Pick<Charity, 'id' | 'name' | 'logo_url' | 'city'>
}

export type ListingWithDetails = ListingPreview & { bids: Bid[] }
