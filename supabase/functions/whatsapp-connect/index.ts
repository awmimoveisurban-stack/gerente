import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Type definitions
interface EvolutionAPIResponse {
  success?: boolean;
  instance?: {
    instanceId?: string;
    instanceName?: string;
    connectionState?: string;
  };
  base64?: string;
  qrcode?: string;
  data?: {
    qrcode?: string;
    base64?: string;
  };
  message?: string;
  error?: string;
}

interface RequestBody {
  action: 'test' | 'connect' | 'disconnect' | 'status';
  instanceName?: string;
}

// Helper function to create standardized response
const createResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

// Helper function to clean QR code
const cleanQRCode = (qrCode: string): string => {
  if (!qrCode || typeof qrCode !== 'string') {
    throw new Error('Invalid QR code input');
  }
  
  // Remove all data:image/png;base64, prefixes
  let cleanBase64 = qrCode.replace(/^data:image\/png;base64,/, '');
  cleanBase64 = cleanBase64.replace(/data:image\/png;base64,/g, '');
  
  // Validate base64 format
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
    throw new Error('Invalid base64 QR code format');
  }
  
  return `data:image/png;base64,${cleanBase64}`;
};

// Helper function to make API requests with retry logic
const makeAPIRequest = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || attempt === maxRetries) {
        return response;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError || new Error('API request failed after retries');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return createResponse({
        success: false,
        error: 'Method not allowed. Use POST.',
      }, 405);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get and validate JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createResponse({
        success: false,
        error: 'Missing or invalid authorization header',
      }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createResponse({
        success: false,
        error: 'Invalid or expired token',
      }, 401);
    }

    // Parse and validate request body
    let requestBody: RequestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return createResponse({
        success: false,
        error: 'Invalid JSON in request body',
      }, 400);
    }

    const { action, instanceName = 'empresa-whatsapp' } = requestBody;

    // Validate required fields
    if (!action) {
      return createResponse({
        success: false,
        error: 'Action is required',
        availableActions: ['test', 'connect', 'disconnect', 'status'],
      }, 400);
    }

    if (!['test', 'connect', 'disconnect', 'status'].includes(action)) {
      return createResponse({
        success: false,
        error: 'Invalid action',
        availableActions: ['test', 'connect', 'disconnect', 'status'],
      }, 400);
    }

    // Evolution API configuration
    const serverUrl = Deno.env.get('EVOLUTION_API_URL') || 'https://api.urbanautobot.com';
    const authApiKey = Deno.env.get('EVOLUTION_API_KEY') || 'cfd9b746ea9e400dc8f4d3e8d57b0180';

    console.log(`🔧 Using Evolution API: ${serverUrl}`);
    console.log(`🔑 API Key configured: ${authApiKey ? 'Yes' : 'No'}`);

    // Database helper functions
    const saveInstanceToDatabase = async (instanceName: string, userId: string, instanceId?: string) => {
      try {
        const { data: existingConfig } = await supabase
          .from('whatsapp_config')
          .select('*')
          .eq('manager_id', userId)
          .eq('instance_name', instanceName)
          .single();

        const configData = {
          manager_id: userId,
          instance_name: instanceName,
          instance_id: instanceId || null,
          status: 'pendente',
          updated_at: new Date().toISOString(),
        };

        if (existingConfig) {
          const { error: updateError } = await supabase
            .from('whatsapp_config')
            .update(configData)
            .eq('id', existingConfig.id);

          if (updateError) {
            console.error('Update config error:', updateError);
            throw new Error('Erro ao atualizar configuração no banco');
          }
        } else {
          const { error: insertError } = await supabase
            .from('whatsapp_config')
            .insert([configData]);

          if (insertError) {
            console.error('Insert config error:', insertError);
            throw new Error('Erro ao salvar configuração no banco');
          }
        }
      } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
      }
    };

    const updateQRInDatabase = async (qrCode: string, instanceName: string, userId: string) => {
      try {
        const { error: updateError } = await supabase
          .from('whatsapp_config')
          .update({
            qrcode: qrCode,
            status: 'aguardando_qr',
            updated_at: new Date().toISOString(),
          })
          .eq('manager_id', userId)
          .eq('instance_name', instanceName);

        if (updateError) {
          console.error('Update QR error:', updateError);
          throw new Error('Erro ao salvar QR Code no banco');
        }
      } catch (error) {
        console.error('QR update failed:', error);
        throw error;
      }
    };

    const updateStatusInDatabase = async (status: string, instanceName: string, userId: string, qrcode: string | null = null) => {
      try {
        const updateData: any = {
          status: status,
          updated_at: new Date().toISOString(),
        };

        if (qrcode !== undefined) {
          updateData.qrcode = qrcode;
        }

        const { error: updateError } = await supabase
          .from('whatsapp_config')
          .update(updateData)
          .eq('manager_id', userId)
          .eq('instance_name', instanceName);

        if (updateError) {
          console.error('Update status error:', updateError);
          throw new Error('Erro ao atualizar status no banco');
        }
      } catch (error) {
        console.error('Status update failed:', error);
        throw error;
      }
    };

    // Handle different actions
    if (action === 'test') {
      return createResponse({
        success: true,
        message: 'Edge Function is working correctly',
        user: user.id,
        timestamp: new Date().toISOString(),
      });

    } else if (action === 'status') {
      try {
        // Check instance status from Evolution API
        const statusResponse = await makeAPIRequest(`${serverUrl}/instance/fetchInstances`, {
          method: 'GET',
          headers: { 'apikey': authApiKey },
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          throw new Error(`Failed to fetch instances: ${statusResponse.status} - ${errorText}`);
        }

        const instancesData = await statusResponse.json();
        const instance = instancesData.find((inst: any) => 
          inst.name === instanceName
        );

        if (!instance) {
          await updateStatusInDatabase('desconectado', instanceName, user.id, null);
          return createResponse({
            success: true,
            status: 'desconectado',
            message: 'Instance not found',
          });
        }

        // Check connection status
        const connectionStatus = instance.connectionStatus || 'disconnected';
        let dbStatus = 'desconectado';
        
        if (connectionStatus === 'open') {
          dbStatus = 'conectado';
        } else if (connectionStatus === 'connecting') {
          dbStatus = 'aguardando_qr';
        }

        await updateStatusInDatabase(dbStatus, instanceName, user.id);

        return createResponse({
          success: true,
          status: dbStatus,
          connectionState: connectionStatus,
          instance: instance,
        });

      } catch (error) {
        console.error('Status check error:', error);
        return createResponse({
          success: false,
          error: error.message || 'Erro ao verificar status',
        }, 500);
      }

    } else if (action === 'connect') {
      try {
        console.log(`🚀 Starting WhatsApp connection for instance: ${instanceName}`);
        
        // Step 1: Check if instance exists
        const checkResponse = await makeAPIRequest(`${serverUrl}/instance/fetchInstances`, {
          method: 'GET',
          headers: { 'apikey': authApiKey },
        });

        let instanceExists = false;
        let instanceId = null;

        if (checkResponse.ok) {
          const instancesData = await checkResponse.json();
          const existingInstance = instancesData.find((inst: any) => 
            inst.name === instanceName
          );
          
          if (existingInstance) {
            instanceExists = true;
            instanceId = existingInstance.id;
            console.log(`✅ Instance ${instanceName} exists with ID: ${instanceId}`);
          }
        }

        // Step 2: Create instance if it doesn't exist
        if (!instanceExists) {
          console.log('📱 Creating new instance...');
          const createResponse = await makeAPIRequest(`${serverUrl}/instance/create`, {
            method: 'POST',
            headers: {
              'apikey': authApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instanceName: instanceName,
              integration: 'WHATSAPP-BAILEYS',
            }),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Erro ao criar instância: ${createResponse.status} - ${errorText}`);
          }

          const createData = await createResponse.json();
          instanceId = createData.instance?.instanceId;
          console.log('✅ Instance created successfully');

          // Save instance to database
          await saveInstanceToDatabase(instanceName, user.id, instanceId || undefined);

          // Wait for instance to be ready
          console.log('⏳ Waiting for instance to be ready...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.log('✅ Instance already exists, skipping creation');
        }

        // Step 3: Connect and get QR Code
        console.log('🔗 Connecting and getting QR Code...');
        const qrResponse = await makeAPIRequest(`${serverUrl}/instance/connect/${instanceName}`, {
          method: 'GET',
          headers: {
            'apikey': authApiKey,
          },
        });

        if (!qrResponse.ok) {
          const errorText = await qrResponse.text();
          throw new Error(`Erro ao obter QR Code: ${qrResponse.status} - ${errorText}`);
        }

        const qrData: EvolutionAPIResponse = await qrResponse.json();
        console.log('QR code response received');

        // Extract QR code from response
        let qrCode = qrData.base64 || qrData.qrcode || qrData.data?.qrcode || qrData.data?.base64;
        
        if (!qrCode) {
          console.error('No QR code found in response:', qrData);
          return createResponse({
            success: false,
            error: 'QR Code não encontrado na resposta da API',
            debug: {
              responseKeys: Object.keys(qrData),
              hasBase64: !!qrData.base64,
              hasQrcode: !!qrData.qrcode,
              hasDataQrcode: !!qrData.data?.qrcode,
              hasDataBase64: !!qrData.data?.base64,
            },
          });
        }

        // Clean and validate QR code
        try {
          qrCode = cleanQRCode(qrCode);
          console.log('✅ QR Code cleaned and validated');
        } catch (error) {
          throw new Error('QR Code format is invalid');
        }

        // Step 4: Update database with QR Code
        await updateQRInDatabase(qrCode, instanceName, user.id);

        console.log('✅ WhatsApp connection flow completed successfully');

        return createResponse({
          success: true,
          qrcode: qrCode,
          message: 'WhatsApp conectado com sucesso - QR Code gerado',
          debug: {
            instanceCreated: !instanceExists,
            instanceId: instanceId,
            qrCodeLength: qrCode.length,
          },
        });

      } catch (error) {
        console.error('WhatsApp connection error:', error);
        return createResponse({
          success: false,
          error: error.message || 'Erro interno ao conectar WhatsApp',
        }, 500);
      }

    } else if (action === 'disconnect') {
      try {
        console.log(`Disconnecting WhatsApp instance: ${instanceName}`);
        
        const deleteResponse = await makeAPIRequest(`${serverUrl}/instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'apikey': authApiKey,
          },
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          throw new Error(`Erro ao deletar instância: ${deleteResponse.status} - ${errorText}`);
        }

        const deleteData = await deleteResponse.json();
        console.log('Instance deleted successfully');

        // Update status in database to disconnected
        await updateStatusInDatabase('desconectado', instanceName, user.id, null);

        return createResponse({
          success: true,
          message: 'Instância desconectada com sucesso',
          instance: deleteData,
        });

      } catch (error) {
        console.error('Disconnect error:', error);
        return createResponse({
          success: false,
          error: error.message || 'Erro ao desconectar WhatsApp',
        }, 500);
      }
    }

    // This should never be reached due to validation above
    return createResponse({
      success: false,
      error: 'Action not implemented',
    }, 501);

  } catch (error) {
    console.error('❌ Error in whatsapp-connect function:', error);
    
    return createResponse({ 
      success: false,
      error: error.message || 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});