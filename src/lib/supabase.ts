import { createClient } from '@supabase/supabase-js';

// 🔐 CONFIGURAÇÃO DO SUPABASE LIMPA E SEGURA
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente Supabase principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 🎯 TIPOS DE DADOS CENTRALIZADOS
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'gerente' | 'corretor';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'Novo' | 'Qualificado' | 'Em Contato' | 'Proposta' | 'Fechado' | 'Perdido';
  origem: string;
  corretor_id?: string;
  observacoes?: string;
  valor?: number;
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface LeadConversation {
  id: string;
  lead_id: string;
  message: string;
  sender: 'corretor' | 'cliente';
  timestamp: string;
  created_at: string;
}

export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// 🚀 FUNÇÕES UTILITÁRIAS
export const supabaseUtils = {
  // Verificar se usuário está autenticado
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  },

  // Verificar permissões
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    // Gerente tem todas as permissões
    if (profile.role === 'gerente') return true;

    // Permissões específicas para corretor
    const corretorPermissions = ['view_own_leads', 'edit_own_leads', 'create_leads'];
    return corretorPermissions.includes(permission);
  },

  // Log de auditoria
  async logAction(userId: string, action: string, details: any = {}) {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

export default supabase;

