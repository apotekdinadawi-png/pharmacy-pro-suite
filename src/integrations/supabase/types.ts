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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      blacklisted_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string
          allergies: Json
          birth_date: string
          created_at: string
          id: string
          join_date: string
          last_visit: string
          medical_notes: string
          member_id: string
          name: string
          phone: string
          points: number
          tier: string
          total_spent: number
          total_visits: number
          updated_at: string
        }
        Insert: {
          address?: string
          allergies?: Json
          birth_date?: string
          created_at?: string
          id?: string
          join_date?: string
          last_visit?: string
          medical_notes?: string
          member_id?: string
          name?: string
          phone?: string
          points?: number
          tier?: string
          total_spent?: number
          total_visits?: number
          updated_at?: string
        }
        Update: {
          address?: string
          allergies?: Json
          birth_date?: string
          created_at?: string
          id?: string
          join_date?: string
          last_visit?: string
          medical_notes?: string
          member_id?: string
          name?: string
          phone?: string
          points?: number
          tier?: string
          total_spent?: number
          total_visits?: number
          updated_at?: string
        }
        Relationships: []
      }
      drugs: {
        Row: {
          active_ingredient: string
          barcode: string
          base_unit: string
          category: string
          conversions: Json
          created_at: string
          id: string
          image_url: string
          kegunaan: string
          min_stock: number
          name: string
          rack: string
          sell_price: number
          stock: number
          updated_at: string
        }
        Insert: {
          active_ingredient?: string
          barcode?: string
          base_unit?: string
          category?: string
          conversions?: Json
          created_at?: string
          id?: string
          image_url?: string
          kegunaan?: string
          min_stock?: number
          name: string
          rack?: string
          sell_price?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active_ingredient?: string
          barcode?: string
          base_unit?: string
          category?: string
          conversions?: Json
          created_at?: string
          id?: string
          image_url?: string
          kegunaan?: string
          min_stock?: number
          name?: string
          rack?: string
          sell_price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      grn_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          invoice_no: string
          supplier_id: string
          supplier_name: string
          top_days: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          invoice_no?: string
          supplier_id?: string
          supplier_name?: string
          top_days?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          invoice_no?: string
          supplier_id?: string
          supplier_name?: string
          top_days?: number
        }
        Relationships: []
      }
      grn_items: {
        Row: {
          batch: string
          buy_price: number
          buy_price_with_ppn: number
          drug_id: string
          drug_name: string
          exp_date: string
          grn_id: string
          id: string
          previous_buy_price: number
          price_increased: boolean
          qty: number
          unit: string
        }
        Insert: {
          batch?: string
          buy_price?: number
          buy_price_with_ppn?: number
          drug_id?: string
          drug_name?: string
          exp_date?: string
          grn_id: string
          id?: string
          previous_buy_price?: number
          price_increased?: boolean
          qty?: number
          unit?: string
        }
        Update: {
          batch?: string
          buy_price?: number
          buy_price_with_ppn?: number
          drug_id?: string
          drug_name?: string
          exp_date?: string
          grn_id?: string
          id?: string
          previous_buy_price?: number
          price_increased?: boolean
          qty?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "grn_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_trackers: {
        Row: {
          created_at: string
          due_date: string
          grn_id: string
          id: string
          invoice_no: string
          receive_date: string
          status: string
          supplier_name: string
          top_days: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string
          grn_id?: string
          id?: string
          invoice_no?: string
          receive_date?: string
          status?: string
          supplier_name?: string
          top_days?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          grn_id?: string
          id?: string
          invoice_no?: string
          receive_date?: string
          status?: string
          supplier_name?: string
          top_days?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      master_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      master_units: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          created_at: string
          date: string
          drug_name: string
          id: string
          new_price: number
          old_price: number
        }
        Insert: {
          created_at?: string
          date?: string
          drug_name?: string
          id?: string
          new_price?: number
          old_price?: number
        }
        Update: {
          created_at?: string
          date?: string
          drug_name?: string
          id?: string
          new_price?: number
          old_price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          sipa: string | null
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          sipa?: string | null
          status?: string
          updated_at?: string
          user_id: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          sipa?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      sp_items: {
        Row: {
          diskon: string
          harga_satuan: string
          id: string
          item_name: string
          keterangan: string
          qty: string
          sp_id: string
          unit: string
        }
        Insert: {
          diskon?: string
          harga_satuan?: string
          id?: string
          item_name?: string
          keterangan?: string
          qty?: string
          sp_id: string
          unit?: string
        }
        Update: {
          diskon?: string
          harga_satuan?: string
          id?: string
          item_name?: string
          keterangan?: string
          qty?: string
          sp_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "sp_items_sp_id_fkey"
            columns: ["sp_id"]
            isOneToOne: false
            referencedRelation: "sp_records"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_records: {
        Row: {
          apoteker_pemesan: string
          created_at: string
          date: string
          id: string
          printed: boolean
          sp_no: string
          sp_type: string
          supplier_id: string
          supplier_name: string
          updated_at: string
        }
        Insert: {
          apoteker_pemesan?: string
          created_at?: string
          date?: string
          id?: string
          printed?: boolean
          sp_no?: string
          sp_type?: string
          supplier_id?: string
          supplier_name?: string
          updated_at?: string
        }
        Update: {
          apoteker_pemesan?: string
          created_at?: string
          date?: string
          id?: string
          printed?: boolean
          sp_no?: string
          sp_type?: string
          supplier_id?: string
          supplier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_cards: {
        Row: {
          batch: string
          created_at: string
          date: string
          drug_name: string
          exp_date: string
          id: string
          qty: number
          source: string
          stock_after: number
          type: string
          unit: string
          user: string
        }
        Insert: {
          batch?: string
          created_at?: string
          date?: string
          drug_name?: string
          exp_date?: string
          id?: string
          qty?: number
          source?: string
          stock_after?: number
          type?: string
          unit?: string
          user?: string
        }
        Update: {
          batch?: string
          created_at?: string
          date?: string
          drug_name?: string
          exp_date?: string
          id?: string
          qty?: number
          source?: string
          stock_after?: number
          type?: string
          unit?: string
          user?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string
          bank_account: string
          bank_account_name: string
          bank_name: string
          created_at: string
          email: string
          id: string
          name: string
          no_cdob: string
          no_izin_pbf: string
          phone: string
          top_days: number
          updated_at: string
        }
        Insert: {
          address?: string
          bank_account?: string
          bank_account_name?: string
          bank_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          no_cdob?: string
          no_izin_pbf?: string
          phone?: string
          top_days?: number
          updated_at?: string
        }
        Update: {
          address?: string
          bank_account?: string
          bank_account_name?: string
          bank_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          no_cdob?: string
          no_izin_pbf?: string
          phone?: string
          top_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          drug_id: string
          drug_name: string
          id: string
          price: number
          qty: number
          subtotal: number
          transaction_id: string
          unit: string
        }
        Insert: {
          drug_id?: string
          drug_name?: string
          id?: string
          price?: number
          qty?: number
          subtotal?: number
          transaction_id: string
          unit?: string
        }
        Update: {
          drug_id?: string
          drug_name?: string
          id?: string
          price?: number
          qty?: number
          subtotal?: number
          transaction_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          date: string
          doctor_name: string | null
          id: string
          kasir: string
          patient_name: string | null
          payment_method: string
          total: number
        }
        Insert: {
          created_at?: string
          date?: string
          doctor_name?: string | null
          id?: string
          kasir?: string
          patient_name?: string | null
          payment_method?: string
          total?: number
        }
        Update: {
          created_at?: string
          date?: string
          doctor_name?: string | null
          id?: string
          kasir?: string
          patient_name?: string | null
          payment_method?: string
          total?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "apj" | "aping" | "kasir"
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
      app_role: ["admin", "apj", "aping", "kasir"],
    },
  },
} as const
