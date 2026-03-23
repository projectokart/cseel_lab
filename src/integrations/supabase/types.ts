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
      assignments: {
        Row: {
          class_id: string
          created_at: string
          due_date: string | null
          experiment_id: string
          id: string
          instructions: string | null
          teacher_id: string
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string
          due_date?: string | null
          experiment_id: string
          id?: string
          instructions?: string | null
          teacher_id: string
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string
          due_date?: string | null
          experiment_id?: string
          id?: string
          instructions?: string | null
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          teacher_id: string
        }
        Insert: {
          class_code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          teacher_id: string
        }
        Update: {
          class_code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          teacher_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          country: string | null
          created_at: string
          email: string
          id: string
          institution: string | null
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          position: string | null
          type: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          id?: string
          institution?: string | null
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          position?: string | null
          type?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          institution?: string | null
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          position?: string | null
          type?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          institution: string | null
          is_read: boolean | null
          message: string | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          institution?: string | null
          is_read?: boolean | null
          message?: string | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          institution?: string | null
          is_read?: boolean | null
          message?: string | null
          name?: string
        }
        Relationships: []
      }
      experiment_sections: {
        Row: {
          content: Json
          created_at: string
          experiment_id: string
          id: string
          is_active: boolean | null
          section_key: string
          sort_order: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          experiment_id: string
          id?: string
          is_active?: boolean | null
          section_key: string
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          experiment_id?: string
          id?: string
          is_active?: boolean | null
          section_key?: string
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_sections_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          class: string | null
          created_at: string
          created_by: string | null
          demo_link: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          materials: string | null
          outcome: string | null
          popularity: number | null
          procedure: string | null
          subject: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_link: string | null
        }
        Insert: {
          class?: string | null
          created_at?: string
          created_by?: string | null
          demo_link?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          materials?: string | null
          outcome?: string | null
          popularity?: number | null
          procedure?: string | null
          subject: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_link?: string | null
        }
        Update: {
          class?: string | null
          created_at?: string
          created_by?: string | null
          demo_link?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          materials?: string | null
          outcome?: string | null
          popularity?: number | null
          procedure?: string | null
          subject?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_link?: string | null
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          content: Json
          id: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      logos: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          price: number
          original_price: number | null
          rating: number | null
          reviews: number | null
          stock: number | null
          image_url: string | null
          tag: string | null
          includes: string[] | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          price: number
          original_price?: number | null
          rating?: number | null
          reviews?: number | null
          stock?: number | null
          image_url?: string | null
          tag?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          price?: number
          original_price?: number | null
          rating?: number | null
          reviews?: number | null
          stock?: number | null
          image_url?: string | null
          tag?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          id: string
          page: string
          user_id: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          page: string
          user_id?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          page?: string
          user_id?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          id: string
          type: string
          title: string
          content: string
          cta_text: string | null
          cta_link: string | null
          bg_color: string
          accent_color: string
          is_active: boolean
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          type: string
          title: string
          content: string
          cta_text?: string | null
          cta_link?: string | null
          bg_color: string
          accent_color: string
          is_active?: boolean
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          title?: string
          content?: string
          cta_text?: string | null
          cta_link?: string | null
          bg_color?: string
          accent_color?: string
          is_active?: boolean
          sort_order?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          institution: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          institution?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          institution?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          answers: Json | null
          assignment_id: string
          graded_at: string | null
          id: string
          score: number | null
          student_id: string
          submitted_at: string
        }
        Insert: {
          answers?: Json | null
          assignment_id: string
          graded_at?: string | null
          id?: string
          score?: number | null
          student_id: string
          submitted_at?: string
        }
        Update: {
          answers?: Json | null
          assignment_id?: string
          graded_at?: string | null
          id?: string
          score?: number | null
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          city: string | null
          created_at: string
          id: string
          institution: string | null
          is_active: boolean | null
          name: string
          photo_url: string | null
          quote: string
          sort_order: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          quote: string
          sort_order?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          quote?: string
          sort_order?: number | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "moderator" | "teacher" | "student"
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
      app_role: ["admin", "moderator", "teacher", "student"],
    },
  },
} as const