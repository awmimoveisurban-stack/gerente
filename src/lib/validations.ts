import { z } from 'zod';

// 🔐 SCHEMAS DE VALIDAÇÃO CENTRALIZADOS
// Baseados nas melhores práticas de validação e segurança

// 📧 Validação de email
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(100, 'Email muito longo');

// 📱 Validação de telefone brasileiro
export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (11) 99999-9999')
  .min(14, 'Telefone muito curto')
  .max(15, 'Telefone muito longo');

// 👤 Validação de nome
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

// 🔑 Validação de senha
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(50, 'Senha muito longa')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número');

// 💰 Validação de valor monetário
export const moneySchema = z
  .number()
  .min(0, 'Valor deve ser positivo')
  .max(10000000, 'Valor muito alto');

// 📊 Validação de score (0-100)
export const scoreSchema = z
  .number()
  .min(0, 'Score deve ser entre 0 e 100')
  .max(100, 'Score deve ser entre 0 e 100');

// 🎯 SCHEMAS DE FORMULÁRIOS

// Login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
});

// Cadastro de usuário
export const userSchema = z.object({
  email: emailSchema,
  full_name: nameSchema,
  role: z.enum(['gerente', 'corretor']),
  password: passwordSchema.optional()
});

// Lead
export const leadSchema = z.object({
  nome: nameSchema,
  email: emailSchema,
  telefone: phoneSchema,
  status: z.enum(['Novo', 'Qualificado', 'Em Contato', 'Proposta', 'Fechado', 'Perdido']),
  origem: z.string().min(1, 'Origem é obrigatória').max(100, 'Origem muito longa'),
  corretor_id: z.string().uuid().optional(),
  observacoes: z.string().max(1000, 'Observações muito longas').optional(),
  valor: moneySchema.optional(),
  score: scoreSchema.optional()
});

// Conversa de lead
export const conversationSchema = z.object({
  lead_id: z.string().uuid('ID do lead inválido'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(2000, 'Mensagem muito longa'),
  sender: z.enum(['corretor', 'cliente'])
});

// Tarefa de lead
export const taskSchema = z.object({
  lead_id: z.string().uuid('ID do lead inválido'),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  due_date: z.string().datetime('Data inválida'),
  status: z.enum(['pending', 'completed', 'cancelled'])
});

// 🔧 FUNÇÕES UTILITÁRIAS DE VALIDAÇÃO

// Validar dados com schema
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Erro de validação desconhecido']
    };
  }
}

// Sanitizar entrada de dados
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres potencialmente perigosos
    .substring(0, 1000); // Limita tamanho
}

// Validar e sanitizar dados de entrada
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  // Sanitizar strings se existirem
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data as any };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitizeInput(sanitized[key]);
      }
    });
    return validateData(schema, sanitized);
  }
  
  return validateData(schema, data);
}

// 🎯 TIPOS INFERIDOS DOS SCHEMAS
export type LoginData = z.infer<typeof loginSchema>;
export type UserData = z.infer<typeof userSchema>;
export type LeadData = z.infer<typeof leadSchema>;
export type ConversationData = z.infer<typeof conversationSchema>;
export type TaskData = z.infer<typeof taskSchema>;

export default {
  emailSchema,
  phoneSchema,
  nameSchema,
  passwordSchema,
  moneySchema,
  scoreSchema,
  loginSchema,
  userSchema,
  leadSchema,
  conversationSchema,
  taskSchema,
  validateData,
  sanitizeInput,
  validateAndSanitize
};

