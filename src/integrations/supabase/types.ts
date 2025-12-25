export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      landing_pages: {
        Row: {
          colors: Json | null
          content: Json | null
          cover_image_url: string | null
          created_at: string
          cta_delay_enabled: boolean | null
          cta_delay_percentage: number | null
          cta_text: string | null
          cta_url: string | null
          description: string | null
          headline: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          page_name: string | null
          pix_pixel_id: string | null
          primary_color: string | null
          profile_image_url: string | null
          slug: string
          subheadline: string | null
          template_id: number
          template_type: string
          updated_at: string
          user_id: string
          video_storage_path: string | null
          video_url: string | null
          views: number | null
          whatsapp_number: string | null
        }
        Insert: {
          colors?: Json | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          cta_delay_enabled?: boolean | null
          cta_delay_percentage?: number | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          page_name?: string | null
          pix_pixel_id?: string | null
          primary_color?: string | null
          profile_image_url?: string | null
          slug: string
          subheadline?: string | null
          template_id?: number
          template_type?: string
          updated_at?: string
          user_id: string
          video_storage_path?: string | null
          video_url?: string | null
          views?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          colors?: Json | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          cta_delay_enabled?: boolean | null
          cta_delay_percentage?: number | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          page_name?: string | null
          pix_pixel_id?: string | null
          primary_color?: string | null
          profile_image_url?: string | null
          slug?: string
          subheadline?: string | null
          template_id?: number
          template_type?: string
          updated_at?: string
          user_id?: string
          video_storage_path?: string | null
          video_url?: string | null
          views?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      page_view_tracking: {
        Row: {
          id: string
          page_id: string
          viewed_at: string
          viewer_fingerprint: string
        }
        Insert: {
          id?: string
          page_id: string
          viewed_at?: string
          viewer_fingerprint?: string
        }
        Update: {
          id?: string
          page_id?: string
          viewed_at?: string
          viewer_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_view_tracking_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          plan_type: string
          subscription_status: string
          subscription_updated_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          plan_type?: string
          subscription_status?: string
          subscription_updated_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          plan_type?: string
          subscription_status?: string
          subscription_updated_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reserved_slugs: {
        Row: {
          reason: string
          slug: string
        }
        Insert: {
          reason: string
          slug: string
        }
        Update: {
          reason?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_page: { Args: { check_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_page_views: {
        Args: { page_id: string; viewer_fingerprint?: string }
        Returns: boolean
      }
      is_subscription_active: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
