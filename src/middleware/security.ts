/**
 * 🛡️ MIDDLEWARE DE SEGURANÇA
 * 
 * Sistema de segurança para APIs e rotas
 * Implementa helmet, CORS, rate limiting e validação
 */

import { Request, Response, NextFunction } from 'express';

// Headers de segurança
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Proteção contra clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Proteção contra MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Proteção XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Política de referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
  );
  
  // Strict Transport Security (HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

// CORS Configuration
export const corsConfig = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yourdomain.com'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin as string) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// Rate Limiting Store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate Limiting Middleware
export const rateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Limpar entradas expiradas
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
    
    const current = rateLimitStore.get(key);
    
    if (!current) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }
    
    if (current.resetTime < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }
    
    if (current.count >= max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
      return;
    }
    
    current.count++;
    next();
  };
};

// Validação de entrada
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          error: 'Validation Error',
          message: error.details[0].message,
          details: error.details
        });
        return;
      }
      
      req.body = value;
      next();
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error validating input'
      });
    }
  };
};

// Sanitização de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remover caracteres perigosos
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// Logging de segurança
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode,
      duration,
      referer: req.headers.referer
    };
    
    // Log apenas requisições suspeitas ou erros
    if (res.statusCode >= 400 || duration > 5000) {
      console.warn('🚨 Security Event:', logData);
    }
  });
  
  next();
};

// Middleware de autenticação
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required'
    });
    return;
  }
  
  // Aqui você validaria o token JWT
  // Por enquanto, apenas passamos adiante
  next();
};

// Middleware de autorização por role
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Aqui você verificaria o role do usuário
    // Por enquanto, apenas passamos adiante
    next();
  };
};

// Middleware de compressão (simulado)
export const compression = (req: Request, res: Response, next: NextFunction) => {
  // Em um ambiente real, você usaria o middleware 'compression'
  next();
};

// Middleware de timeout
export const timeout = (ms: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'Request took too long to process'
        });
      }
    }, ms);
    
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    next();
  };
};



