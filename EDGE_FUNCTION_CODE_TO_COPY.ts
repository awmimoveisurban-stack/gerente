import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get JWT token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Parse request body
    const requestBody = await req.json()
    const { action, instanceName = 'empresa-whatsapp' } = requestBody;
    
    console.log('🎯 Extracted action:', action);
    console.log('🎯 Extracted instanceName:', instanceName);
    console.log('🎯 Request body keys:', Object.keys(requestBody));

    // Evolution API configuration
    const serverUrl = Deno.env.get('EVOLUTION_API_URL')
    const authApiKey = Deno.env.get('EVOLUTION_API_KEY')

    if (!serverUrl || !authApiKey) {
      throw new Error('Evolution API configuration missing')
    }

    // Helper function to clean QR code
    const cleanQRCode = (qrCode: string): string => {
      const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
      const cleanBase64 = base64Data.replace(/data:image\/png;base64,/g, '');
      return `data:image/png;base64,${cleanBase64}`;
    }

    // Helper function to save instance to database
    const saveInstanceToDatabase = async (instanceName: string, userId: string, instanceId?: string) => {
      const { data: existingConfig } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('manager_id', userId)
        .eq('instance_name', instanceName)
        .single();

      if (existingConfig) {
        const { error: updateError } = await supabase
          .from('whatsapp_config')
          .update({
            instance_id: instanceId || null,
            status: 'pendente',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (updateError) {
          console.error('Update config error:', updateError);
          throw new Error('Erro ao atualizar configuração no banco');
        }
      } else {
        const { error: insertError } = await supabase
          .from('whatsapp_config')
          .insert({
            manager_id: userId,
            instance_name: instanceName,
            instance_id: instanceId || null,
            status: 'pendente'
          });

        if (insertError) {
          console.error('Insert config error:', insertError);
          throw new Error('Erro ao salvar configuração no banco');
        }
      }
    }

    // Helper function to update QR in database
    const updateQRInDatabase = async (qrCode: string, instanceName: string, userId: string) => {
      const { error: updateError } = await supabase
        .from('whatsapp_config')
        .update({
          qrcode: qrCode,
          status: 'aguardando_qr',
          updated_at: new Date().toISOString()
        })
        .eq('manager_id', userId)
        .eq('instance_name', instanceName);

      if (updateError) {
        console.error('Update QR error:', updateError);
        throw new Error('Erro ao salvar QR Code no banco');
      }
    }

    if (action === 'test') {
      // Simple test to verify function is working
      return new Response(JSON.stringify({
        success: true,
        message: 'Edge Function is working',
        user: user.id,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'connect') {
      // 🚀 UNIFIED CONNECTION FLOW - Create instance if needed, then get QR Code
      console.log('🚀 Starting unified WhatsApp connection flow for instance:', instanceName);
      
      try {
        // Step 1: Check if instance exists
        console.log('📋 Step 1: Checking if instance exists...');
        const checkResponse = await fetch(`${serverUrl}/instance/fetchInstances`, {
          method: 'GET',
          headers: { 'apikey': authApiKey },
        });

        let instanceExists = false;
        let instanceId = null;

        if (checkResponse.ok) {
          const instancesData = await checkResponse.json();
          console.log('Available instances:', instancesData);
          
          const existingInstance = instancesData.data?.find((inst: any) => 
            inst.instance?.instanceName === instanceName
          );
          
          if (existingInstance) {
            instanceExists = true;
            instanceId = existingInstance.instance?.instanceId;
            console.log(`✅ Instance ${instanceName} exists with ID: ${instanceId}`);
          } else {
            console.log(`❌ Instance ${instanceName} does not exist`);
          }
        } else {
          console.log('Could not fetch instances, will attempt to create');
        }

        // Step 2: Create instance if it doesn't exist
        if (!instanceExists) {
          console.log('📱 Step 2: Creating instance...');
          const createResponse = await fetch(`${serverUrl}/instance/create/${instanceName}`, {
            method: 'POST',
            headers: {
              'apikey': authApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instanceName: instanceName,
              webhook: `${supabaseUrl}/functions/v1/whatsapp-webhook`,
              webhook_by_events: true,
              events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
            }),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Create instance error:', createResponse.status, errorText);
            throw new Error(`Erro ao criar instância: ${createResponse.status} - ${errorText}`);
          }

          const createData = await createResponse.json();
          console.log('✅ Instance created:', createData);
          instanceId = createData.instance?.instanceId;

          // Save instance to database
          await saveInstanceToDatabase(instanceName, user.id, instanceId);

          // Wait for instance to be ready
          console.log('⏳ Step 3: Waiting for instance to be ready...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log('✅ Step 2: Instance already exists, skipping creation');
        }

        // Step 3: Connect and get QR Code
        console.log('🔗 Step 4: Connecting and getting QR Code...');
        const qrResponse = await fetch(`${serverUrl}/instance/connect/${instanceName}`, {
          method: 'POST',
          headers: {
            'apikey': authApiKey,
            'Content-Type': 'application/json',
          },
        });

        console.log('QR Response status:', qrResponse.status);

        if (!qrResponse.ok) {
          const errorText = await qrResponse.text();
          console.error('QR code error:', qrResponse.status, errorText);
          throw new Error(`Erro ao obter QR Code: ${qrResponse.status} - ${errorText}`);
        }

        const qrData = await qrResponse.json();
        console.log('QR code response:', JSON.stringify(qrData, null, 2));

        // Try different possible QR code fields
        let qrCode = qrData.base64 || qrData.qrcode || qrData.data?.qrcode || qrData.data?.base64;
        
        if (!qrCode) {
          console.error('No QR code found in response:', qrData);
          return new Response(JSON.stringify({
            success: false,
            error: 'QR Code não encontrado na resposta da API',
            debug: {
              responseKeys: Object.keys(qrData),
              fullResponse: qrData
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Clean QR code format
        const originalQrCode = qrCode;
        qrCode = cleanQRCode(qrCode);
        
        if (originalQrCode !== qrCode) {
          console.log('🧹 Fixed QR code format:', {
            originalLength: originalQrCode.length,
            cleanedLength: qrCode.length,
            hasDuplicatePrefix: originalQrCode.includes('data:image/png;base64,data:image/png;base64,')
          });
        }

        console.log('✅ QR Code found, length:', qrCode.length);

        // Step 4: Update database with QR Code
        await updateQRInDatabase(qrCode, instanceName, user.id);

        console.log('✅ WhatsApp connection flow completed successfully');

        return new Response(JSON.stringify({
          success: true,
          qrcode: qrCode,
          message: 'WhatsApp conectado com sucesso - QR Code gerado',
          debug: {
            instanceCreated: !instanceExists,
            instanceId: instanceId,
            qrCodeLength: qrCode.length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('WhatsApp connection error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message || 'Erro interno ao conectar WhatsApp',
          debug: {
            errorName: error.name,
            errorStack: error.stack
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    } else if (action === 'disconnect') {
      // Delete WhatsApp instance from Evolution API
      console.log('Deleting WhatsApp instance:', instanceName);
      
      const deleteResponse = await fetch(`${serverUrl}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': authApiKey,
        },
      });

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error('Delete error:', deleteResponse.status, errorText);
        throw new Error(`Erro ao deletar instância: ${deleteResponse.status} - ${errorText}`);
      }

      const deleteData = await deleteResponse.json();
      console.log('Delete response:', deleteData);

      // Update status in database to disconnected
      const { error: updateError } = await supabase
        .from('whatsapp_config')
        .update({
          status: 'desconectado',
          qrcode: null,
          updated_at: new Date().toISOString()
        })
        .eq('manager_id', user.id)
        .eq('instance_name', instanceName);

      if (updateError) {
        console.error('Update disconnect status error:', updateError);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Instância desconectada com sucesso',
        instance: deleteData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Unknown action
      return new Response(JSON.stringify({
        success: false,
        error: 'Ação não reconhecida',
        availableActions: ['test', 'connect', 'disconnect'],
        receivedAction: action
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in whatsapp-connect function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      success: false,
      debug: {
        errorName: error.name,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})












