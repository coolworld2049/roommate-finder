export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      amenities: {
        Row: {
          category: Database["public"]["Enums"]["category_type"]
          created_at: string | null
          icon_svg: string | null
          id: number
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          icon_svg?: string | null
          id?: number
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          icon_svg?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      higher_education_specialties: {
        Row: {
          area: string
          code: string
          id: number
          qualification: string
        }
        Insert: {
          area: string
          code: string
          id?: number
          qualification: string
        }
        Update: {
          area?: string
          code?: string
          id?: number
          qualification?: string
        }
        Relationships: []
      }
      interest_areas: {
        Row: {
          created_at: string | null
          icon_svg: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          icon_svg?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          icon_svg?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      preferences: {
        Row: {
          category: Database["public"]["Enums"]["category_type"]
          created_at: string | null
          id: number
          name: string
          options: string[] | null
        }
        Insert: {
          category: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          id?: number
          name: string
          options?: string[] | null
        }
        Update: {
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          id?: number
          name?: string
          options?: string[] | null
        }
        Relationships: []
      }
      profile_socials: {
        Row: {
          id: number
          profile_id: string
          telegram: string | null
          vk: string | null
        }
        Insert: {
          id?: number
          profile_id: string
          telegram?: string | null
          vk?: string | null
        }
        Update: {
          id?: number
          profile_id?: string
          telegram?: string | null
          vk?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_socials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_universities: {
        Row: {
          created_at: string | null
          geo_lat: number | null
          geo_lon: number | null
          graduation_year: number
          id: number
          profile_id: string
          specialty_id: number | null
          university_address: string
          university_name: string
        }
        Insert: {
          created_at?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          graduation_year: number
          id?: number
          profile_id: string
          specialty_id?: number | null
          university_address: string
          university_name: string
        }
        Update: {
          created_at?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          graduation_year?: number
          id?: number
          profile_id?: string
          specialty_id?: number | null
          university_address?: string
          university_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_universities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_universities_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "higher_education_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string | null
          dob: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          interest_areas: string[] | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          dob: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          interest_areas?: string[] | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          dob?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          interest_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          address_data: Json | null
          advertising_as: Database["public"]["Enums"]["advertising_as"]
          bathrooms_number: number
          bills_included: boolean
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          geo_lat: number | null
          geo_lon: number | null
          id: number
          images: string[] | null
          nearest_metro_station: Json | null
          profile_id: string
          property_type: Database["public"]["Enums"]["property_type"]
          rent_price_month: number
          status: Database["public"]["Enums"]["ad_status"]
          stay_duration: Database["public"]["Enums"]["stay_duration"]
          title: string
        }
        Insert: {
          address: string
          address_data?: Json | null
          advertising_as: Database["public"]["Enums"]["advertising_as"]
          bathrooms_number: number
          bills_included?: boolean
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          id?: number
          images?: string[] | null
          nearest_metro_station?: Json | null
          profile_id: string
          property_type: Database["public"]["Enums"]["property_type"]
          rent_price_month: number
          status?: Database["public"]["Enums"]["ad_status"]
          stay_duration: Database["public"]["Enums"]["stay_duration"]
          title: string
        }
        Update: {
          address?: string
          address_data?: Json | null
          advertising_as?: Database["public"]["Enums"]["advertising_as"]
          bathrooms_number?: number
          bills_included?: boolean
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          id?: number
          images?: string[] | null
          nearest_metro_station?: Json | null
          profile_id?: string
          property_type?: Database["public"]["Enums"]["property_type"]
          rent_price_month?: number
          status?: Database["public"]["Enums"]["ad_status"]
          stay_duration?: Database["public"]["Enums"]["stay_duration"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: number
          created_at: string | null
          id: number
          property_id: number
          value: boolean
        }
        Insert: {
          amenity_id: number
          created_at?: string | null
          id?: number
          property_id: number
          value?: boolean
        }
        Update: {
          amenity_id?: number
          created_at?: string | null
          id?: number
          property_id?: number
          value?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_room_tenant_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_in_preferences: {
        Row: {
          created_at: string | null
          id: number
          preference_id: number
          property_id: number
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          preference_id: number
          property_id: number
          value: string
        }
        Update: {
          created_at?: string | null
          id?: number
          preference_id?: number
          property_id?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_in_preferences_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "preferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_in_preferences_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_in_preferences_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_room_tenant_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string | null
          id: number
          property_id: number
          roommate_id: number
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          property_id: number
          roommate_id: number
          score: number
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: number
          property_id?: number
          roommate_id?: number
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_room_tenant_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "recommendations_roommate_id_fkey"
            columns: ["roommate_id"]
            isOneToOne: false
            referencedRelation: "roommates"
            referencedColumns: ["id"]
          },
        ]
      }
      room_amenities: {
        Row: {
          amenity_id: number
          created_at: string | null
          id: number
          room_id: number
          value: boolean
        }
        Insert: {
          amenity_id: number
          created_at?: string | null
          id?: number
          room_id: number
          value?: boolean
        }
        Update: {
          amenity_id?: number
          created_at?: string | null
          id?: number
          room_id?: number
          value?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "room_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_amenities_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_tenants: {
        Row: {
          age: number
          avatar: string | null
          bio: string | null
          created_at: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: number
          room_id: number
        }
        Insert: {
          age: number
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: number
          room_id: number
        }
        Update: {
          age?: number
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: number
          room_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_tenants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      roommate_in_preferences: {
        Row: {
          created_at: string | null
          id: number
          preference_id: number
          roommate_id: number
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          preference_id: number
          roommate_id: number
          value: string
        }
        Update: {
          created_at?: string | null
          id?: number
          preference_id?: number
          roommate_id?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "roommate_in_preferences_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "preferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roommate_in_preferences_roommate_id_fkey"
            columns: ["roommate_id"]
            isOneToOne: false
            referencedRelation: "roommates"
            referencedColumns: ["id"]
          },
        ]
      }
      roommates: {
        Row: {
          address: string
          address_data: Json | null
          budget_month: number
          created_at: string | null
          description: string | null
          geo_lat: number | null
          geo_lon: number | null
          id: number
          move_in_date: string
          profile_id: string
          rooms_number: number[] | null
          status: Database["public"]["Enums"]["ad_status"]
          tenants_age: number[] | null
          tenants_number: number[] | null
          title: string
        }
        Insert: {
          address: string
          address_data?: Json | null
          budget_month: number
          created_at?: string | null
          description?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          id?: number
          move_in_date: string
          profile_id: string
          rooms_number?: number[] | null
          status?: Database["public"]["Enums"]["ad_status"]
          tenants_age?: number[] | null
          tenants_number?: number[] | null
          title: string
        }
        Update: {
          address?: string
          address_data?: Json | null
          budget_month?: number
          created_at?: string | null
          description?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          id?: number
          move_in_date?: string
          profile_id?: string
          rooms_number?: number[] | null
          status?: Database["public"]["Enums"]["ad_status"]
          tenants_age?: number[] | null
          tenants_number?: number[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roommates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          available_from: string | null
          created_at: string | null
          description: string | null
          id: number
          images: string[] | null
          property_id: number
          room_size: Database["public"]["Enums"]["room_size"] | null
          room_type: Database["public"]["Enums"]["room_type"]
          status: Database["public"]["Enums"]["ad_status"]
          title: string
        }
        Insert: {
          available_from?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          images?: string[] | null
          property_id: number
          room_size?: Database["public"]["Enums"]["room_size"] | null
          room_type: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["ad_status"]
          title: string
        }
        Update: {
          available_from?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          images?: string[] | null
          property_id?: number
          room_size?: Database["public"]["Enums"]["room_size"] | null
          room_type?: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["ad_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_room_tenant_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
    }
    Views: {
      property_recommendations_view: {
        Row: {
          property_id: number | null
          recommendations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_room_tenant_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_room_tenant_summary: {
        Row: {
          available_from_max: string | null
          available_from_min: string | null
          gender_female_count: number | null
          gender_male_count: number | null
          profile_id: string | null
          property_id: number | null
          rent_per_tenant: number | null
          rooms_number: number | null
          tenants_age_avg: number | null
          tenants_age_max: number | null
          tenants_age_min: number | null
          tenants_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roommate_recommendations_view: {
        Row: {
          recommendations: Json | null
          roommate_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_roommate_id_fkey"
            columns: ["roommate_id"]
            isOneToOne: false
            referencedRelation: "roommates"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          geo_lat: number | null
          geo_lon: number | null
          university_address: string | null
          university_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ad_status: "active" | "inactive" | "paused"
      advertising_as: "tenant" | "owner" | "live_in_landlord"
      category_type: "property" | "room" | "roommate"
      gender: "male" | "female" | "unknown"
      property_type: "apartment" | "house" | "townhouse" | "loft" | "studio"
      room_size: "small" | "medium" | "large"
      room_type: "private" | "shared"
      share_with: "male" | "female" | "no_one" | "anyone"
      stay_duration: "semester" | "two_semester" | "flexible"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

