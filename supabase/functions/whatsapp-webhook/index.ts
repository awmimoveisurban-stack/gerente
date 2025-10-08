import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Handle connection updates
    if (webhookData.event === 'CONNECTION_UPDATE') {
      const { instance, state } = webhookData.data;
      
      let newStatus = 'desconectado';
      if (state === 'open') {
        newStatus = 'conectado';
      } else if (state === 'connecting') {
        newStatus = 'aguardando_qr';
      }

      // Update WhatsApp config status
      const { error: updateError } = await supabase
        .from('whatsapp_config')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('instance_name', instance);

      if (updateError) {
        console.error('Error updating connection status:', updateError);
      } else {
        console.log(`Connection status updated to: ${newStatus} for instance: ${instance}`);
      }
    }

    // Handle incoming messages
    if (webhookData.event === 'MESSAGES_UPSERT') {
      const { messages } = webhookData.data;
      
      for (const message of messages) {
        // Only process incoming messages (not outgoing)
        if (message.key.fromMe) continue;
        
        const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const messageText = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || '';
        
        if (!phoneNumber || !messageText) continue;

        console.log(`New message from ${phoneNumber}: ${messageText}`);

        // Create or update lead from WhatsApp message
        await createLeadFromWhatsApp(supabase, phoneNumber, messageText);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createLeadFromWhatsApp(supabase: any, phoneNumber: string, messageText: string) {
  try {
    // Format phone number (remove country code if needed)
    const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('*')
      .or(`telefone.eq.${formattedPhone},telefone.eq.${phoneNumber}`)
      .single();

    if (existingLead) {
      // Update existing lead with new interaction
      await supabase
        .from('interactions')
        .insert({
          user_id: existingLead.user_id,
          lead_id: existingLead.id,
          tipo: 'whatsapp',
          descricao: `Mensagem recebida: ${messageText}`,
          data_interacao: new Date().toISOString()
        });

      // Update last interaction time
      await supabase
        .from('leads')
        .update({
          ultima_interacao: new Date().toISOString()
        })
        .eq('id', existingLead.id);

      console.log(`Updated existing lead: ${existingLead.nome}`);
    } else {
      // Create new lead
      // Get a random corretor to assign the lead
      const { data: corretores } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('cargo', 'corretor')
        .eq('ativo', true);

      if (corretores && corretores.length > 0) {
        const randomCorretor = corretores[Math.floor(Math.random() * corretores.length)];
        
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            user_id: randomCorretor.user_id,
            nome: `Lead WhatsApp ${phoneNumber}`,
            telefone: formattedPhone,
            status: 'novo',
            imovel_interesse: 'Interesse via WhatsApp',
            observacoes: `Lead criado automaticamente via WhatsApp. Mensagem: ${messageText}`,
            corretor: 'Sistema WhatsApp'
          })
          .select()
          .single();

        if (newLead) {
          // Create interaction record
          await supabase
            .from('interactions')
            .insert({
              user_id: randomCorretor.user_id,
              lead_id: newLead.id,
              tipo: 'whatsapp',
              descricao: `Lead criado automaticamente. Mensagem: ${messageText}`,
              data_interacao: new Date().toISOString()
            });

          console.log(`Created new lead: ${newLead.nome} assigned to corretor: ${randomCorretor.user_id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating lead from WhatsApp:', error);
  }
}





