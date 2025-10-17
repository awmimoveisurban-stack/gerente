/**
 * Validators and Sanitizers
 * Validação e sanitização de dados de leads
 */

// ============================================
// SANITIZAÇÃO (Limpeza de dados)
// ============================================

export const sanitizeName = (name: string): string => {
  // Trim + capitalizar primeira letra de cada palavra
  return name
    .trim()
    .split(' ')
    .filter(word => word.length > 0) // Remove espaços extras
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const sanitizeEmail = (email: string): string => {
  // Trim + lowercase + remove espaços
  return email.trim().toLowerCase().replace(/\s/g, '');
};

export const sanitizePhoneNumber = (phone: string): string => {
  // Remove tudo exceto números
  const cleaned = phone.replace(/\D/g, '');

  // Se tem 10 ou 11 dígitos (número BR sem código país)
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`; // Adiciona +55 (Brasil)
  }

  // Se já tem 12 ou 13 dígitos (com 55)
  if (cleaned.length === 12 || cleaned.length === 13) {
    return cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  }

  // Retorna cleaned se não se encaixa nos padrões
  return cleaned;
};

// ============================================
// VALIDAÇÃO (Verificação de formato)
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateName = (nome: string): ValidationResult => {
  const trimmed = nome.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Nome deve ter pelo menos 3 caracteres' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Nome muito longo (máx 100 caracteres)' };
  }

  // Verificar se tem pelo menos 1 letra
  if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) {
    return { valid: false, error: 'Nome deve conter letras' };
  }

  return { valid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Email é obrigatório' };
  }

  // Regex rigorosa
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Email inválido (ex: nome@dominio.com)' };
  }

  // Verificar se não tem espaços
  if (trimmed.includes(' ')) {
    return { valid: false, error: 'Email não pode conter espaços' };
  }

  // Verificar domínio
  const domain = trimmed.split('@')[1];
  if (!domain || domain.length < 3) {
    return { valid: false, error: 'Domínio de email inválido' };
  }

  return { valid: true };
};

export const validateBrazilianPhone = (phone: string): ValidationResult => {
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 0) {
    return { valid: false, error: 'Telefone é obrigatório' };
  }

  // Aceitar 10, 11, 12 ou 13 dígitos
  // 10: Fixo sem 9 (ex: 1133334444)
  // 11: Celular com 9 (ex: 11999999999)
  // 12: BR Fixo sem 9 (ex: 551133334444)
  // 13: BR Celular com 9 (ex: 5511999999999)

  const validLengths = [10, 11, 12, 13];
  if (!validLengths.includes(numbers.length)) {
    return {
      valid: false,
      error: 'Telefone inválido. Use formato: (11) 99999-9999',
    };
  }

  // Extrair DDD (primeiros 2 dígitos ou depois do 55)
  const ddd =
    numbers.length >= 12
      ? parseInt(numbers.slice(2, 4)) // Com código país
      : parseInt(numbers.slice(0, 2)); // Sem código país

  // Verificar DDD válido (11-99)
  if (ddd < 11 || ddd > 99) {
    return {
      valid: false,
      error: 'DDD inválido (deve ser entre 11 e 99)',
    };
  }

  // Se for celular (11 dígitos sem 55, ou 13 com 55), deve começar com 9
  if (numbers.length === 11 && numbers[2] !== '9') {
    return {
      valid: false,
      error: 'Celular deve ter 9 dígitos (ex: 9XXXX-XXXX)',
    };
  }

  if (numbers.length === 13 && numbers[4] !== '9') {
    return {
      valid: false,
      error: 'Celular deve ter 9 dígitos (ex: 55 11 9XXXX-XXXX)',
    };
  }

  return { valid: true };
};

// ============================================
// FORMATAÇÃO (Display)
// ============================================

export const formatPhoneNumber = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');

  // Remover código país (55) se tiver
  const localNumber =
    numbers.startsWith('55') && numbers.length >= 12
      ? numbers.slice(2)
      : numbers;

  // Formatar (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (localNumber.length === 11) {
    // Celular: (11) 99999-9999
    return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
  } else if (localNumber.length === 10) {
    // Fixo: (11) 3333-4444
    return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`;
  }

  return phone; // Retorna original se não se encaixa
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};



