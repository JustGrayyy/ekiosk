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
      sentiment_logs: {
        Row: {
          id: string
          feeling: string
          created_at: string | null
        }
        Insert: {
          id?: string
          feeling: string
          created_at?: string | null
        }
        Update: {
          id?: string
          feeling?: string
          created_at?: string | null
        }
        Relationships: []
      }
      trivia_logs: {
        Row: {
          id: string
          question_id: number
          is_correct: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          question_id: number
          is_correct: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          question_id?: number
          is_correct?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          id: string
          message: string
          created_at: string | null
        }
        Insert: {
          id?: string
          message: string
          created_at?: string | null
        }
        Update: {
          id?: string
          message?: string
          created_at?: string | null
        }
        Relationships: []
      }
      allowed_products: {
        Row: {
          barcode: string
          category: string
          name: string
          points_value: number
        }
        Insert: {
          barcode: string
          category?: string
          name: string
          points_value?: number
        }
        Update: {
          barcode?: string
          category?: string
          name?: string
          points_value?: number
        }
        Relationships: []
      }
      redemption_logs: {
        Row: {
          id: string
          lrn: string
          points_redeemed: number
          redeemed_at: string | null
          reward_name: string
        }
        Insert: {
          id?: string
          lrn: string
          points_redeemed: number
          redeemed_at?: string | null
          reward_name: string
        }
        Update: {
          id?: string
          lrn?: string
          points_redeemed?: number
          redeemed_at?: string | null
          reward_name?: string
        }
        Relationships: []
      }
      scan_logs: {
        Row: {
          id: string
          lrn: string
          points_added: number | null
          product_name: string | null
          scanned_at: string | null
          section: string | null
        }
        Insert: {
          id?: string
          lrn: string
          points_added?: number | null
          product_name?: string | null
          scanned_at?: string | null
          section?: string | null
        }
        Update: {
          id?: string
          lrn?: string
          points_added?: number | null
          product_name?: string | null
          scanned_at?: string | null
          section?: string | null
        }
        Relationships: []
      }
      student_points: {
        Row: {
          full_name: string
          last_updated: string | null
          lrn: string
          points_balance: number | null
          section: string | null
        }
        Insert: {
          full_name: string
          last_updated?: string | null
          lrn: string
          points_balance?: number | null
          section?: string | null
        }
        Update: {
          full_name?: string
          last_updated?: string | null
          lrn?: string
          points_balance?: number | null
          section?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_points: {
        Args: {
          points_to_add?: number
          student_lrn: string
          student_name: string
          student_section?: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
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
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
