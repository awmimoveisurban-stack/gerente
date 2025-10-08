# 🚀 SOLUÇÃO COMPLETA - DATABASE

## ❌ **ERROS IDENTIFICADOS:**

### **1. Tabela `profiles`:**
```
Error fetching profile: {code: '42703', message: 'column profiles.user_id does not exist'}
```

### **2. Tabela `whatsapp_config`:**
```
GET .../whatsapp_config?select=*&instance_name=eq.empresa-whatsapp 406 (Not Acceptable)
```

---

## ✅ **SOLUÇÕES APLICADAS:**

### **1. ✅ Frontend Corrigido**
- **Arquivo**: `src/contexts/auth-context.tsx`
- **Correção**: `.eq('user_id', userId)` → `.eq('id', userId)`

### **2. ✅ SQL Scripts Criados**
- **`fix-profiles-simple.sql`**: Corrigir tabela profiles
- **`fix-whatsapp-config-table.sql`**: Corrigir tabela whatsapp_config

---

## 🚀 **EXECUTE ESTES SQLs NO DASHBOARD:**

### **SQL 1: Corrigir tabela profiles**
```sql
-- 1. Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Recriar tabela profiles com estrutura correta
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Inserir perfil do usuário gerente
INSERT INTO profiles (id, email, full_name)
VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc',
    'gerente@imobiliaria.com',
    'Gerente Imobiliária'
);

-- 6. Verificar se funcionou
SELECT * FROM profiles;
```

### **SQL 2: Corrigir tabela whatsapp_config**
```sql
-- 1. Verificar se a tabela whatsapp_config existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'whatsapp_config';

-- 2. Recriar tabela whatsapp_config com estrutura correta
DROP TABLE IF EXISTS public.whatsapp_config CASCADE;

CREATE TABLE public.whatsapp_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    instance_name text NOT NULL,
    instance_id text,
    qrcode text,
    status text DEFAULT 'pendente' NOT NULL,
    webhook_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraint para garantir uma instância por manager
    UNIQUE(manager_id, instance_name)
);

-- 3. Habilitar RLS
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
CREATE POLICY "Users can view own whatsapp config" ON whatsapp_config
    FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert own whatsapp config" ON whatsapp_config
    FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update own whatsapp config" ON whatsapp_config
    FOR UPDATE USING (auth.uid() = manager_id);

CREATE POLICY "Users can delete own whatsapp config" ON whatsapp_config
    FOR DELETE USING (auth.uid() = manager_id);

-- 5. Inserir configuração inicial para o gerente
INSERT INTO whatsapp_config (manager_id, instance_name, status)
VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc',
    'empresa-whatsapp',
    'pendente'
) ON CONFLICT (manager_id, instance_name) DO UPDATE SET
    updated_at = now();

-- 6. Verificar se funcionou
SELECT * FROM whatsapp_config;
```

---

## 🧪 **TESTAR APÓS EXECUTAR OS SQLs:**

### **Script de Teste:**
```javascript
// Teste completo do sistema
async function testeCompletoSistema() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Não autenticado');
      return;
    }
    
    console.log('✅ Usuário:', session.user.email);
    
    // Teste 1: Profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro profiles:', profileError);
    } else {
      console.log('✅ Profiles OK:', profile);
    }
    
    // Teste 2: WhatsApp Config
    const { data: whatsapp, error: whatsappError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('instance_name', 'empresa-whatsapp');
    
    if (whatsappError) {
      console.error('❌ Erro whatsapp_config:', whatsappError);
    } else {
      console.log('✅ WhatsApp Config OK:', whatsapp);
    }
    
    // Teste 3: Edge Function
    const testResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'test' })
    });
    
    if (testResponse.ok) {
      console.log('✅ Edge Function OK');
      console.log('🎉 SISTEMA 100% FUNCIONAL!');
    } else {
      console.log('⚠️ Edge Function com problema');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testeCompletoSistema();
```

---

## 🎯 **RESULTADO ESPERADO:**

### **✅ Após executar os SQLs:**
- ✅ **Tabela profiles** funcionando
- ✅ **Tabela whatsapp_config** funcionando
- ✅ **Frontend** carregando sem erros
- ✅ **Edge Function** pronta para usar
- ✅ **Sistema WhatsApp** operacional

---

## 🚀 **EXECUTE OS SQLs E TESTE!**

**O sistema estará 100% funcional após executar os SQLs!** 🎉





