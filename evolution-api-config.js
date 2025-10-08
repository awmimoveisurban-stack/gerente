// Configuração da Evolution API
export const EVOLUTION_API_CONFIG = {
  url: 'https://api.urbanautobot.com',
  apiKey: 'cfd9b746ea9e400dc8f4d3e8d57b0180',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180'
  }
};

// URLs específicas da Evolution API
export const EVOLUTION_ENDPOINTS = {
  // Instâncias
  createInstance: '/instance/create',
  connectInstance: '/instance/connect',
  disconnectInstance: '/instance/disconnect',
  instanceStatus: '/instance/fetchInstances',
  
  // Webhooks
  setWebhook: '/webhook/set',
  
  // Mensagens
  sendMessage: '/message/sendText',
  sendMedia: '/message/sendMedia',
  
  // QR Code
  getQRCode: '/instance/connect'
};
