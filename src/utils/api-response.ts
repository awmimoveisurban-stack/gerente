/**
 * 📡 PADRONIZAÇÃO DE RESPOSTAS DE API
 * 
 * Sistema padronizado para respostas de API
 * Formato consistente para sucesso, erro e validação
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// Códigos de erro padronizados
export const ErrorCodes = {
  // Autenticação e Autorização
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validação
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELDS: 'MISSING_FIELDS',
  
  // Recursos
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Servidor
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // WhatsApp/Integrações
  WHATSAPP_ERROR: 'WHATSAPP_ERROR',
  EVOLUTION_API_ERROR: 'EVOLUTION_API_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR'
} as const;

// Classe para respostas de sucesso
export class SuccessResponse<T = any> {
  public readonly success = true;
  public readonly data: T;
  public readonly meta: ApiResponse['meta'];

  constructor(data: T, meta?: ApiResponse['meta']) {
    this.data = data;
    this.meta = {
      timestamp: new Date().toISOString(),
      ...meta
    };
  }

  static create<T>(data: T, meta?: ApiResponse['meta']): SuccessResponse<T> {
    return new SuccessResponse(data, meta);
  }

  static withPagination<T>(
    data: T,
    page: number,
    limit: number,
    total: number,
    meta?: Omit<ApiResponse['meta'], 'pagination'>
  ): SuccessResponse<T> {
    const totalPages = Math.ceil(total / limit);
    
    return new SuccessResponse(data, {
      ...meta,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  }
}

// Classe para respostas de erro
export class ErrorResponse {
  public readonly success = false;
  public readonly error: ApiResponse['error'];

  constructor(error: ApiError) {
    this.error = {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  static create(error: ApiError): ErrorResponse {
    return new ErrorResponse(error);
  }

  static unauthorized(message = 'Unauthorized access'): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.UNAUTHORIZED,
      message,
      statusCode: 401
    });
  }

  static forbidden(message = 'Access forbidden'): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.FORBIDDEN,
      message,
      statusCode: 403
    });
  }

  static notFound(message = 'Resource not found'): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.NOT_FOUND,
      message,
      statusCode: 404
    });
  }

  static validationError(message: string, details?: any): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.VALIDATION_ERROR,
      message,
      details,
      statusCode: 400
    });
  }

  static internalError(message = 'Internal server error', details?: any): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.INTERNAL_ERROR,
      message,
      details,
      statusCode: 500
    });
  }

  static rateLimitExceeded(message = 'Rate limit exceeded'): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
      message,
      statusCode: 429
    });
  }

  static whatsappError(message: string, details?: any): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.WHATSAPP_ERROR,
      message,
      details,
      statusCode: 502
    });
  }

  static aiServiceError(message: string, details?: any): ErrorResponse {
    return new ErrorResponse({
      code: ErrorCodes.AI_SERVICE_ERROR,
      message,
      details,
      statusCode: 502
    });
  }
}

// Middleware para padronizar respostas
export const apiResponseMiddleware = (req: any, res: any, next: any) => {
  // Adicionar métodos de resposta padronizados
  res.apiSuccess = <T>(data: T, meta?: ApiResponse['meta']) => {
    const response = SuccessResponse.create(data, meta);
    return res.json(response);
  };

  res.apiError = (error: ApiError) => {
    const response = ErrorResponse.create(error);
    return res.status(error.statusCode).json(response);
  };

  res.apiUnauthorized = (message?: string) => {
    const response = ErrorResponse.unauthorized(message);
    return res.status(401).json(response);
  };

  res.apiForbidden = (message?: string) => {
    const response = ErrorResponse.forbidden(message);
    return res.status(403).json(response);
  };

  res.apiNotFound = (message?: string) => {
    const response = ErrorResponse.notFound(message);
    return res.status(404).json(response);
  };

  res.apiValidationError = (message: string, details?: any) => {
    const response = ErrorResponse.validationError(message, details);
    return res.status(400).json(response);
  };

  res.apiInternalError = (message?: string, details?: any) => {
    const response = ErrorResponse.internalError(message, details);
    return res.status(500).json(response);
  };

  res.apiRateLimitExceeded = (message?: string) => {
    const response = ErrorResponse.rateLimitExceeded(message);
    return res.status(429).json(response);
  };

  res.apiWhatsappError = (message: string, details?: any) => {
    const response = ErrorResponse.whatsappError(message, details);
    return res.status(502).json(response);
  };

  res.apiAiServiceError = (message: string, details?: any) => {
    const response = ErrorResponse.aiServiceError(message, details);
    return res.status(502).json(response);
  };

  next();
};

// Utilitário para tratar erros async
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Utilitário para tratar erros globalmente
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('🚨 API Error:', err);

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.apiValidationError('Validation failed', err.details);
  }

  // Erro do Supabase
  if (err.code && err.message && err.hint) {
    return res.apiInternalError('Database error', {
      code: err.code,
      message: err.message,
      hint: err.hint
    });
  }

  // Erro de sintaxe JSON
  if (err.type === 'entity.parse.failed') {
    return res.apiValidationError('Invalid JSON format');
  }

  // Erro padrão
  return res.apiInternalError('An unexpected error occurred', {
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Utilitário para gerar IDs únicos de requisição
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Utilitário para log de requisições
export const requestLogger = (req: any, res: any, next: any) => {
  const requestId = generateRequestId();
  req.requestId = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };

    console.log(`📡 API Request:`, logData);
  });

  next();
};




