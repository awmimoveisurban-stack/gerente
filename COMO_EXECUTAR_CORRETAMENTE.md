# 🔧 COMO EXECUTAR CORRETAMENTE

## ❌ **ERRO COMUM:**
```
ERROR: 42601: syntax error at or near "async"
```

**Causa**: Você tentou executar JavaScript no SQL Editor do Supabase.

---

## ✅ **ONDE EXECUTAR CADA COISA:**

### **1. 🗄️ SQL (No Supabase Dashboard)**
- **Local**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/sql
- **O que**: Scripts SQL para criar tabelas
- **Como**: Cole o SQL e clique "Run"

### **2. 🧪 JavaScript (No Console do Navegador)**
- **Local**: F12 → Console (no navegador)
- **O que**: Scripts de teste
- **Como**: Cole o JavaScript e pressione Enter

---

## 🚀 **PASSOS CORRETOS:**

### **PASSO 1: 🗄️ Executar SQL no Dashboard**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/sql
2. **Cole**: Este SQL:

```sql
-- 1. Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('corretor', 'gerente')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 2. Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Inserir role para o usuário gerente
INSERT INTO user_roles (user_id, role) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'gerente')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- 5. Verificar se funcionou
SELECT * FROM user_roles;
```

3. **Execute**: Clique "Run"

### **PASSO 2: 🔐 Fazer login**
1. **Acesse**: http://127.0.0.1:3006/auth
2. **Email**: `gerente@imobiliaria.com`
3. **Senha**: `admin123`
4. **Clique**: "Entrar"

### **PASSO 3: 🧪 Testar no Console**
1. **Pressione**: F12 (abrir DevTools)
2. **Vá na aba**: "Console"
3. **Cole**: Este JavaScript:

```javascript
// 🧪 TESTE SIMPLES DE NAVEGAÇÃO
function testNavigation() {
  console.log('🧪 TESTANDO NAVEGAÇÃO');
  console.log('📍 Página atual:', window.location.pathname);
  
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase não está carregado');
    return;
  }
  
  console.log('✅ Supabase carregado');
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      console.error('❌ Usuário não autenticado');
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    
    supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id)
      .then(({ data: roles, error: rolesError }) => {
        if (rolesError) {
          console.error('❌ Erro na tabela user_roles:', rolesError);
          return;
        }
        
        if (roles && roles.length > 0) {
          console.log('✅ Roles encontradas:', roles);
          console.log('🎉 NAVEGAÇÃO FUNCIONANDO!');
        } else {
          console.log('⚠️ Nenhuma role encontrada');
        }
      });
  });
}

testNavigation();
```

4. **Pressione**: Enter

---

## 🎯 **TESTAR NAVEGAÇÃO:**

### **URLs para testar:**
1. **Kanban**: http://127.0.0.1:3006/kanban
2. **Leads**: http://127.0.0.1:3006/leads
3. **WhatsApp**: http://127.0.0.1:3006/gerente/whatsapp
4. **Dashboard**: http://127.0.0.1:3006/gerente

---

## 🎉 **RESULTADO ESPERADO:**

### **✅ Após executar o SQL:**
- ✅ **Tabela user_roles** criada
- ✅ **Role de gerente** atribuída
- ✅ **Navegação** funcionando

### **✅ Após executar o JavaScript:**
- ✅ **Supabase carregado**
- ✅ **Usuário logado**
- ✅ **Roles encontradas**
- ✅ **Navegação funcionando**

---

## 🚨 **LEMBRE-SE:**

### **SQL**: No Supabase Dashboard
### **JavaScript**: No Console do Navegador (F12)

---

## 🚀 **EXECUTE NA ORDEM CORRETA!**

**1. SQL no Dashboard → 2. Login → 3. JavaScript no Console**

**A navegação funcionará!** 🎉





