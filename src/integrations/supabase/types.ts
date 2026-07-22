export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      booking_events: {
        Row: {
          author_email: string | null;
          author_id: string | null;
          booking_id: string;
          created_at: string;
          id: string;
          note: string | null;
          status: string;
        };
        Insert: {
          author_email?: string | null;
          author_id?: string | null;
          booking_id: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          status: string;
        };
        Update: {
          author_email?: string | null;
          author_id?: string | null;
          booking_id?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          address: string | null;
          booking_ref: string;
          brand: string;
          city: string | null;
          created_at: string;
          device_type: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          model: string;
          notes: string | null;
          phone: string;
          postcode: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          problem: string;
          service_type: Database["public"]["Enums"]["service_type"];
          status: Database["public"]["Enums"]["booking_status"];
          status_note: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          booking_ref: string;
          brand: string;
          city?: string | null;
          created_at?: string;
          device_type: string;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          model: string;
          notes?: string | null;
          phone: string;
          postcode?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          problem: string;
          service_type?: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["booking_status"];
          status_note?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          booking_ref?: string;
          brand?: string;
          city?: string | null;
          created_at?: string;
          device_type?: string;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          model?: string;
          notes?: string | null;
          phone?: string;
          postcode?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          problem?: string;
          service_type?: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["booking_status"];
          status_note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      city_pages: {
        Row: {
          body: string;
          created_at: string;
          h1: string;
          id: string;
          intro: string;
          meta_description: string;
          meta_title: string;
          name: string;
          postcodes: string;
          published: boolean;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          h1?: string;
          id?: string;
          intro?: string;
          meta_description?: string;
          meta_title?: string;
          name: string;
          postcodes?: string;
          published?: boolean;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          h1?: string;
          id?: string;
          intro?: string;
          meta_description?: string;
          meta_title?: string;
          name?: string;
          postcodes?: string;
          published?: boolean;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      device_brands: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      device_models: {
        Row: {
          active: boolean;
          brand_id: string;
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          brand_id: string;
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          brand_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "device_models_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "device_brands";
            referencedColumns: ["id"];
          },
        ];
      };
      faqs: {
        Row: {
          answer: string;
          category: string | null;
          created_at: string;
          id: string;
          published: boolean;
          question: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          answer: string;
          category?: string | null;
          created_at?: string;
          id?: string;
          published?: boolean;
          question: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          category?: string | null;
          created_at?: string;
          id?: string;
          published?: boolean;
          question?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_items: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string;
          published: boolean;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url: string;
          published?: boolean;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string;
          published?: boolean;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          created_at: string;
          device: string | null;
          email: string | null;
          id: string;
          message: string | null;
          name: string;
          phone: string | null;
          source: string;
        };
        Insert: {
          created_at?: string;
          device?: string | null;
          email?: string | null;
          id?: string;
          message?: string | null;
          name: string;
          phone?: string | null;
          source?: string;
        };
        Update: {
          created_at?: string;
          device?: string | null;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string | null;
          source?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      repair_types: {
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          author: string;
          body: string;
          created_at: string;
          featured: boolean;
          id: string;
          location: string | null;
          published: boolean;
          rating: number;
          sort_order: number;
          source: string | null;
          updated_at: string;
        };
        Insert: {
          author: string;
          body: string;
          created_at?: string;
          featured?: boolean;
          id?: string;
          location?: string | null;
          published?: boolean;
          rating?: number;
          sort_order?: number;
          source?: string | null;
          updated_at?: string;
        };
        Update: {
          author?: string;
          body?: string;
          created_at?: string;
          featured?: boolean;
          id?: string;
          location?: string | null;
          published?: boolean;
          rating?: number;
          sort_order?: number;
          source?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          active: boolean;
          category: string;
          created_at: string;
          description: string | null;
          estimated_time: string | null;
          features: Json | null;
          icon: string | null;
          id: string;
          price_from: string | null;
          short: string | null;
          slug: string;
          sort_order: number;
          title: string;
          turnaround: string | null;
          updated_at: string;
          warranty: string | null;
        };
        Insert: {
          active?: boolean;
          category?: string;
          created_at?: string;
          description?: string | null;
          estimated_time?: string | null;
          features?: Json | null;
          icon?: string | null;
          id?: string;
          price_from?: string | null;
          short?: string | null;
          slug: string;
          sort_order?: number;
          title: string;
          turnaround?: string | null;
          updated_at?: string;
          warranty?: string | null;
        };
        Update: {
          active?: boolean;
          category?: string;
          created_at?: string;
          description?: string | null;
          estimated_time?: string | null;
          features?: Json | null;
          icon?: string | null;
          id?: string;
          price_from?: string | null;
          short?: string | null;
          slug?: string;
          sort_order?: number;
          title?: string;
          turnaround?: string | null;
          updated_at?: string;
          warranty?: string | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "staff";
      booking_status:
        | "pending"
        | "diagnosing"
        | "repair_started"
        | "waiting_parts"
        | "completed"
        | "ready_for_collection"
        | "delivered"
        | "cancelled";
      service_type: "walk_in" | "home_visit" | "mail_in";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      booking_status: [
        "pending",
        "diagnosing",
        "repair_started",
        "waiting_parts",
        "completed",
        "ready_for_collection",
        "delivered",
        "cancelled",
      ],
      service_type: ["walk_in", "home_visit", "mail_in"],
    },
  },
} as const;
