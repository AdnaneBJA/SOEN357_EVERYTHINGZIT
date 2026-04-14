export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; email: string; display_name: string | null
          avatar_url: string | null; role: Database['public']['Enums']['user_role']
          created_at: string
        }
        Insert: {
          id: string; email: string; display_name?: string | null
          avatar_url?: string | null; role?: Database['public']['Enums']['user_role']
          created_at?: string
        }
        Update: {
          id?: string; email?: string; display_name?: string | null
          avatar_url?: string | null; role?: Database['public']['Enums']['user_role']
          created_at?: string
        }
        Relationships: []
      }
      charities: {
        Row: {
          id: string; name: string; description: string; logo_url: string | null
          city: string; pickup_days: string[]; is_active: boolean; created_at: string
        }
        Insert: {
          id?: string; name: string; description: string; logo_url?: string | null
          city: string; pickup_days?: string[]; is_active?: boolean; created_at?: string
        }
        Update: {
          id?: string; name?: string; description?: string; logo_url?: string | null
          city?: string; pickup_days?: string[]; is_active?: boolean; created_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          id: string; seller_id: string; charity_id: string
          title: string; description: string
          category: Database['public']['Enums']['item_category']
          size: string; condition: Database['public']['Enums']['item_condition']
          photo_urls: string[]; starting_price: number
          current_highest_bid: number | null; bid_ends_at: string
          status: Database['public']['Enums']['listing_status']
          pickup_day: string | null; pickup_time_window: string | null; created_at: string
        }
        Insert: {
          id?: string; seller_id: string; charity_id: string
          title: string; description: string
          category: Database['public']['Enums']['item_category']
          size: string; condition: Database['public']['Enums']['item_condition']
          photo_urls?: string[]; starting_price?: number
          current_highest_bid?: number | null; bid_ends_at: string
          status?: Database['public']['Enums']['listing_status']
          pickup_day?: string | null; pickup_time_window?: string | null; created_at?: string
        }
        Update: {
          id?: string; seller_id?: string; charity_id?: string
          title?: string; description?: string
          category?: Database['public']['Enums']['item_category']
          size?: string; condition?: Database['public']['Enums']['item_condition']
          photo_urls?: string[]; starting_price?: number
          current_highest_bid?: number | null; bid_ends_at?: string
          status?: Database['public']['Enums']['listing_status']
          pickup_day?: string | null; pickup_time_window?: string | null; created_at?: string
        }
        Relationships: []
      }
      bids: {
        Row: { id: string; listing_id: string; bidder_id: string; amount: number; created_at: string }
        Insert: { id?: string; listing_id: string; bidder_id: string; amount: number; created_at?: string }
        Update: { id?: string; listing_id?: string; bidder_id?: string; amount?: number; created_at?: string }
        Relationships: []
      }
      donations: {
        Row: { id: string; listing_id: string; donor_id: string; charity_id: string; created_at: string }
        Insert: { id?: string; listing_id: string; donor_id: string; charity_id: string; created_at?: string }
        Update: { id?: string; listing_id?: string; donor_id?: string; charity_id?: string; created_at?: string }
        Relationships: []
      }
      pickups: {
        Row: {
          id: string; listing_id: string; charity_id: string
          status: Database['public']['Enums']['pickup_status']
          scheduled_date: string | null; collected_at: string | null; created_at: string
        }
        Insert: {
          id?: string; listing_id: string; charity_id: string
          status?: Database['public']['Enums']['pickup_status']
          scheduled_date?: string | null; collected_at?: string | null; created_at?: string
        }
        Update: {
          id?: string; listing_id?: string; charity_id?: string
          status?: Database['public']['Enums']['pickup_status']
          scheduled_date?: string | null; collected_at?: string | null; created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      place_bid:        { Args: { p_listing_id: string; p_bidder_id: string; p_amount: number }; Returns: undefined }
      donate_direct:    { Args: { p_listing_id: string }; Returns: undefined }
      finalize_listing: { Args: { p_listing_id: string }; Returns: undefined }
      submit_donation: {
        Args: {
          p_charity_id: string; p_title: string; p_description: string
          p_category: string; p_size: string; p_condition: string
          p_photo_urls: string[]; p_pickup_day: string | null; p_pickup_time_window: string | null
        }
        Returns: string
      }
    }
    Enums: {
      user_role:      'user' | 'charity_rep'
      item_category:  'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories' | 'bags' | 'other'
      item_condition: 'new_with_tags' | 'like_new' | 'good' | 'fair'
      listing_status: 'active' | 'sold' | 'donated' | 'direct_donated'
      pickup_status:  'pending' | 'scheduled' | 'collected'
    }
    CompositeTypes: Record<string, never>
  }
}
