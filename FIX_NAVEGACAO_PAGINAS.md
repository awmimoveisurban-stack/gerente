# 🔧 CORRIGIR NAVEGAÇÃO DAS PÁGINAS

## ❌ **PROBLEMA:**
```
As páginas não estão abrindo, a única que abre é o dashboard
```

**Causa**: A tabela `user_roles` não existe, então o sistema não consegue determinar as permissões dos usuários.

---

## ✅ **SOLUÇÃO:**

### **PASSO 1: 🗄️ Criar tabela user_roles**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/sql
2. **Cole**: O conteúdo do arquivo `create-user-roles-table.sql`
3. **Execute**: Clique "Run"

### **PASSO 2: 🔐 Fazer login novamente**
1. **Acesse**: http://127.0.0.1:3006/auth
2. **Email**: `gerente@imobiliaria.com`
3. **Senha**: `admin123`
4. **Clique**: "Entrar"

### **PASSO 3: 📱 Testar navegação**
1. **Após login**: Será redirecionado para `/gerente`
2. **Teste**: Acessar `/kanban`, `/leads`, `/gerente/whatsapp`

---

## 🚀 **SQL PARA EXECUTAR:**

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

---

## 🎯 **PÁGINAS DISPONÍVEIS APÓS CORREÇÃO:**

### **✅ Para usuário GERENTE:**
- ✅ **Dashboard**: `/gerente`
- ✅ **WhatsApp**: `/gerente/whatsapp`
- ✅ **Kanban**: `/kanban`
- ✅ **Leads**: `/leads`

### **✅ Para usuário CORRETOR:**
- ✅ **Dashboard**: `/dashboard`
- ✅ **Kanban**: `/kanban`
- ✅ **Leads**: `/leads`

---

## 🧪 **TESTAR NAVEGAÇÃO:**

### **Script de teste:**
```javascript
// Teste de navegação
async function testNavigation() {
  console.log('🧪 TESTANDO NAVEGAÇÃO');
  
  try {
    // 1. Verificar se está logado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Não está logado');
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    
    // 2. Testar user_roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (rolesError) {
      console.error('❌ Erro na tabela user_roles:', rolesError);
      console.log('💡 Executar SQL: create-user-roles-table.sql');
      return;
    }
    
    if (roles && roles.length > 0) {
      console.log('✅ Roles encontradas:', roles);
      
      // 3. Testar navegação
      const currentPath = window.location.pathname;
      console.log('📍 Página atual:', currentPath);
      
      if (currentPath.includes('/gerente')) {
        console.log('✅ Página de gerente carregada');
      } else if (currentPath.includes('/dashboard')) {
        console.log('✅ Página de corretor carregada');
      } else {
        console.log('⚠️ Página não identificada');
      }
      
    } else {
      console.log('⚠️ Nenhuma role encontrada');
      console.log('💡 Executar SQL para inserir role');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testNavigation();
```

---

## 🎉 **RESULTADO ESPERADO:**

### **✅ Após executar o SQL:**
- ✅ **Tabela user_roles** criada
- ✅ **Role de gerente** atribuída ao usuário
- ✅ **Navegação** funcionando
- ✅ **Todas as páginas** acessíveis

### **✅ Após fazer login:**
- ✅ **Redirecionamento** automático para `/gerente`
- ✅ **Menu lateral** com todas as opções
- ✅ **Acesso** a todas as páginas

---

## 🚀 **EXECUTE O SQL E TESTE!**

**A navegação funcionará corretamente!** 🎉

**URLs para testar:**
- http://127.0.0.1:3006/kanban
- http://127.0.0.1:3006/leads
- http://127.0.0.1:3006/gerente/whatsapp





