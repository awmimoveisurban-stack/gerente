export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      interactions: {
        Row: {
          created_at: string;
          data_interacao: string;
          descricao: string;
          id: string;
          lead_id: string;
          tipo: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data_interacao?: string;
          descricao: string;
          id?: string;
          lead_id: string;
          tipo: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data_interacao?: string;
          descricao?: string;
          id?: string;
          lead_id?: string;
          tipo?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interactions_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          corretor: string | null;
          created_at: string;
          data_entrada: string;
          email: string | null;
          id: string;
          imovel_interesse: string | null;
          nome: string;
          observacoes: string | null;
          status: string;
          telefone: string | null;
          ultima_interacao: string | null;
          updated_at: string;
          user_id: string;
          valor_interesse: number | null;
        };
        Insert: {
          corretor?: string | null;
          created_at?: string;
          data_entrada?: string;
          email?: string | null;
          id?: string;
          imovel_interesse?: string | null;
          nome: string;
          observacoes?: string | null;
          status?: string;
          telefone?: string | null;
          ultima_interacao?: string | null;
          updated_at?: string;
          user_id: string;
          valor_interesse?: number | null;
        };
        Update: {
          corretor?: string | null;
          created_at?: string;
          data_entrada?: string;
          email?: string | null;
          id?: string;
          imovel_interesse?: string | null;
          nome?: string;
          observacoes?: string | null;
          status?: string;
          telefone?: string | null;
          ultima_interacao?: string | null;
          updated_at?: string;
          user_id?: string;
          valor_interesse?: number | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: number;
          metadata: Json | null;
          sender_id: string;
          thread_id: number;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: never;
          metadata?: Json | null;
          sender_id: string;
          thread_id: number;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: never;
          metadata?: Json | null;
          sender_id?: string;
          thread_id?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          ativo: boolean | null;
          cargo: string | null;
          created_at: string;
          email: string;
          id: string;
          nome: string;
          telefone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ativo?: boolean | null;
          cargo?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          nome: string;
          telefone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ativo?: boolean | null;
          cargo?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          nome?: string;
          telefone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          area_construida: number | null;
          area_total: number | null;
          banheiros: number | null;
          cep: string | null;
          cidade: string;
          created_at: string;
          descricao: string | null;
          endereco: string;
          estado: string;
          garagem: number | null;
          id: string;
          quartos: number | null;
          status: string;
          tipo: string;
          titulo: string;
          updated_at: string;
          user_id: string;
          valor: number | null;
        };
        Insert: {
          area_construida?: number | null;
          area_total?: number | null;
          banheiros?: number | null;
          cep?: string | null;
          cidade: string;
          created_at?: string;
          descricao?: string | null;
          endereco: string;
          estado: string;
          garagem?: number | null;
          id?: string;
          quartos?: number | null;
          status?: string;
          tipo: string;
          titulo: string;
          updated_at?: string;
          user_id: string;
          valor?: number | null;
        };
        Update: {
          area_construida?: number | null;
          area_total?: number | null;
          banheiros?: number | null;
          cep?: string | null;
          cidade?: string;
          created_at?: string;
          descricao?: string | null;
          endereco?: string;
          estado?: string;
          garagem?: number | null;
          id?: string;
          quartos?: number | null;
          status?: string;
          tipo?: string;
          titulo?: string;
          updated_at?: string;
          user_id?: string;
          valor?: number | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          created_at: string;
          data_vencimento: string | null;
          descricao: string | null;
          id: string;
          lead_id: string | null;
          prioridade: string | null;
          status: string | null;
          titulo: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data_vencimento?: string | null;
          descricao?: string | null;
          id?: string;
          lead_id?: string | null;
          prioridade?: string | null;
          status?: string | null;
          titulo: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data_vencimento?: string | null;
          descricao?: string | null;
          id?: string;
          lead_id?: string | null;
          prioridade?: string | null;
          status?: string | null;
          titulo?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['app_role'];
          user_id?: string;
        };
        Relationships: [];
      };
      visits: {
        Row: {
          created_at: string;
          data_visita: string;
          endereco: string;
          id: string;
          lead_id: string;
          observacoes: string | null;
          property_id: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data_visita: string;
          endereco: string;
          id?: string;
          lead_id: string;
          observacoes?: string | null;
          property_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data_visita?: string;
          endereco?: string;
          id?: string;
          lead_id?: string;
          observacoes?: string | null;
          property_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'visits_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'visits_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      whatsapp_config: {
        Row: {
          created_at: string;
          evolution_instance_name: string | null;
          evolution_instance_token: string | null;
          id: string;
          manager_id: string;
          qr_code: string | null;
          status: string;
          updated_at: string;
          auto_created: boolean | null;
          deleted_at: string | null;
        };
        Insert: {
          created_at?: string;
          evolution_instance_name?: string | null;
          evolution_instance_token?: string | null;
          id?: string;
          manager_id: string;
          qr_code?: string | null;
          status?: string;
          updated_at?: string;
          auto_created?: boolean | null;
          deleted_at?: string | null;
        };
        Update: {
          created_at?: string;
          evolution_instance_name?: string | null;
          evolution_instance_token?: string | null;
          id?: string;
          manager_id?: string;
          qr_code?: string | null;
          status?: string;
          updated_at?: string;
          auto_created?: boolean | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_user_email: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: {
          _role: Database['public']['Enums']['app_role'];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'corretor' | 'gerente';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ['corretor', 'gerente'],
    },
  },
} as const;
