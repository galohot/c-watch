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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      corruption_cases: {
        Row: {
          actors_verification_status: string | null
          article_id: string | null
          asset_recovery_idr: number | null
          case_category: string | null
          case_registration_number: string | null
          case_status: string | null
          charges_filed: Json | null
          corruption_severity_score: number | null
          corruption_type: string[] | null
          court_name: string | null
          created_at: string
          defamation_risk_level: string | null
          estimated_losses_idr: number | null
          excerpt: string | null
          government_level: string | null
          id: string
          image_url: string | null
          incident_start_date: string | null
          institutions_involved: Json | null
          language: string | null
          metadata: Json | null
          primary_suspects: Json | null
          published_date: string | null
          regions_affected: string[] | null
          sector: string | null
          source_api: string
          source_name: string | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
          verdict_date: string | null
          verification_status: string | null
        }
        Insert: {
          actors_verification_status?: string | null
          article_id?: string | null
          asset_recovery_idr?: number | null
          case_category?: string | null
          case_registration_number?: string | null
          case_status?: string | null
          charges_filed?: Json | null
          corruption_severity_score?: number | null
          corruption_type?: string[] | null
          court_name?: string | null
          created_at?: string
          defamation_risk_level?: string | null
          estimated_losses_idr?: number | null
          excerpt?: string | null
          government_level?: string | null
          id?: string
          image_url?: string | null
          incident_start_date?: string | null
          institutions_involved?: Json | null
          language?: string | null
          metadata?: Json | null
          primary_suspects?: Json | null
          published_date?: string | null
          regions_affected?: string[] | null
          sector?: string | null
          source_api: string
          source_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          verdict_date?: string | null
          verification_status?: string | null
        }
        Update: {
          actors_verification_status?: string | null
          article_id?: string | null
          asset_recovery_idr?: number | null
          case_category?: string | null
          case_registration_number?: string | null
          case_status?: string | null
          charges_filed?: Json | null
          corruption_severity_score?: number | null
          corruption_type?: string[] | null
          court_name?: string | null
          created_at?: string
          defamation_risk_level?: string | null
          estimated_losses_idr?: number | null
          excerpt?: string | null
          government_level?: string | null
          id?: string
          image_url?: string | null
          incident_start_date?: string | null
          institutions_involved?: Json | null
          language?: string | null
          metadata?: Json | null
          primary_suspects?: Json | null
          published_date?: string | null
          regions_affected?: string[] | null
          sector?: string | null
          source_api?: string
          source_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          verdict_date?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
