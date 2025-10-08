# 🔧 CORRIGIR ERRO DA TABELA PROFILES

## ❌ **ERRO IDENTIFICADO:**
```
Error fetching profile: {code: '42703', message: 'column profiles.user_id does not exist'}
```

**Problema**: O frontend está tentando usar `user_id` mas a coluna correta é `id`.

---

## 🚀 **SOLUÇÃO COMPLETA:**

### **PASSO 1: 🗄️ CORRIGIR TABELA PROFILES NO BANCO**

#### **1.1 Executar este SQL no Supabase Dashboard:**
```sql
-- 1. Verificar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Se a tabela não existir, criar com estrutura correta
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Se a tabela existir mas tiver user_id, renomear para id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles RENAME COLUMN user_id TO id;
        ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
        ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Inserir perfil do usuário gerente se não existir
INSERT INTO profiles (id, email, full_name)
VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc',
    'gerente@imobiliaria.com',
    'Gerente Imobiliária'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
```

### **PASSO 2: 🔧 CORRIGIR FRONTEND**

#### **2.1 O arquivo `auth-context.tsx` já está correto:**
A linha 52 usa `.eq('user_id', userId)` mas deveria usar `.eq('id', userId)`.

#### **2.2 Vou corrigir o arquivo:**
```typescript
// Linha 52: Mudar de
.eq('user_id', userId)
// Para:
.eq('id', userId)
```

### **PASSO 3: 🧪 TESTAR CORREÇÃO**

#### **3.1 Execute este script no console:**
```javascript
// Teste da correção da tabela profiles
async function testProfilesFix() {
  console.log('🧪 Testando correção da tabela profiles...');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Não autenticado');
      return;
    }
    
    console.log('✅ Usuário:', session.user.email);
    console.log('✅ User ID:', session.user.id);
    
    // Testar query corrigida
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)  // Usando 'id' em vez de 'user_id'
      .single();
    
    if (error) {
      console.error('❌ Erro na query:', error);
      console.log('💡 Executar SQL de correção no Dashboard');
    } else {
      console.log('✅ Query funcionando!');
      console.log('📊 Profile data:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testProfilesFix();
```

---

## 🎯 **RESULTADO ESPERADO:**

### **✅ Após corrigir:**
- ✅ **Tabela profiles** com estrutura correta
- ✅ **Frontend** fazendo query correta
- ✅ **Auth context** funcionando
- ✅ **Sistema** carregando sem erros

---

## 🚨 **EXECUTE OS PASSOS ACIMA EM ORDEM:**

1. ✅ **Executar SQL** no Dashboard
2. ✅ **Corrigir frontend** (já vou fazer)
3. ✅ **Testar** com script

---

## 🎉 **APÓS CORRIGIR:**

**O sistema estará funcionando perfeitamente!** 🚀





