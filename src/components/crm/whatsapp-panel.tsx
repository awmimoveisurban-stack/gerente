import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import { MessageSquare, QrCode, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export const WhatsAppPanel = () => {
  const { config, loading, connecting, createInstance, getQRCode, checkStatus } = useWhatsApp();
  const [statusChecking, setStatusChecking] = useState(false);

  // Auto-check status every 30 seconds when QR code is showing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (config?.status === 'aguardando_qr') {
      interval = setInterval(async () => {
        try {
          await checkStatus();
        } catch (error) {
          console.error('Erro ao verificar status automaticamente:', error);
        }
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config?.status, checkStatus]);

  const handleCreateInstance = async () => {
    try {
      await createInstance();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleGetQRCode = async () => {
    try {
      await getQRCode();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCheckStatus = async () => {
    setStatusChecking(true);
    try {
      await checkStatus();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setStatusChecking(false);
    }
  };

  const getStatusBadge = () => {
    if (!config) return null;

    const statusConfig = {
      conectado: { color: 'default', icon: CheckCircle, text: 'Conectado' },
      aguardando_qr: { color: 'secondary', icon: QrCode, text: 'Aguardando QR' },
      pendente: { color: 'outline', icon: Clock, text: 'Pendente' },
      desconectado: { color: 'destructive', icon: XCircle, text: 'Desconectado' }
    } as const;

    const status = statusConfig[config.status] || statusConfig.pendente;
    const Icon = status.icon;

    return (
      <Badge variant={status.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.text}
      </Badge>
    );
  };

  const renderActionButton = () => {
    if (!config) {
      return (
        <Button onClick={handleCreateInstance} disabled={loading} className="w-full">
          {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          <MessageSquare className="mr-2 h-4 w-4" />
          Conectar WhatsApp
        </Button>
      );
    }

    switch (config.status) {
      case 'pendente':
      case 'desconectado':
        return (
          <Button onClick={handleGetQRCode} disabled={connecting} className="w-full">
            {connecting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            <QrCode className="mr-2 h-4 w-4" />
            Gerar QR Code
          </Button>
        );
      
      case 'aguardando_qr':
        return (
          <div className="space-y-2">
            <Button onClick={handleGetQRCode} disabled={connecting} variant="outline" className="w-full">
              {connecting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar QR Code
            </Button>
            <Button 
              onClick={handleCheckStatus} 
              disabled={statusChecking} 
              variant="secondary" 
              className="w-full"
            >
              {statusChecking && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Verificar Status
            </Button>
          </div>
        );
      
      case 'conectado':
        return (
          <Button 
            onClick={handleCheckStatus} 
            disabled={statusChecking} 
            variant="outline" 
            className="w-full"
          >
            {statusChecking && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Status
          </Button>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="crm-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configuração WhatsApp
          </span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Configure a integração do WhatsApp para sua equipe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {config?.status === 'aguardando_qr' && config.qrcode && (
          <div className="flex flex-col items-center space-y-3 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Escaneie o QR Code abaixo com seu WhatsApp:
            </p>
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={`data:image/png;base64,${config.qrcode}`} 
                alt="QR Code WhatsApp" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              O QR Code expira em alguns segundos. Se não conseguir escanear, gere um novo.
            </p>
          </div>
        )}

        {config?.status === 'conectado' && (
          <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                WhatsApp conectado com sucesso!
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                Sua equipe já pode enviar mensagens
              </p>
            </div>
          </div>
        )}

        {config && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Instância:</strong> {config.instance_name}</p>
            {config.instance_id && <p><strong>ID:</strong> {config.instance_id}</p>}
            <p><strong>Última atualização:</strong> {new Date(config.updated_at).toLocaleString('pt-BR')}</p>
          </div>
        )}

        {renderActionButton()}

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ Importante:</p>
          <ul className="space-y-1 text-xs">
            <li>• Apenas gerentes podem configurar o WhatsApp</li>
            <li>• A conexão é compartilhada com toda a equipe</li>
            <li>• Mantenha o WhatsApp ativo no celular</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};