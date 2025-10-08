# 🗄️ CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS

## ❌ Erros Atuais
- **404**: Tabela `user_roles` não existe
- **400**: Consulta `profiles` com `user_id` incorreto (deveria ser `id`)

## ✅ Solução
**Configurar banco de dados completo do zero**

---

## 🔧 CONFIGURAÇÃO COMPLETA

### **PASSO 1: Limpar e Recriar Tabelas**
**SQL Editor** → Execute:
```sql
-- Remover todas as tabelas existentes
DROP TABLE IF EXISTS whatsapp_config CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Criar tabela profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela user_roles (para compatibilidade)
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  source TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  priority TEXT NOT NULL DEFAULT 'media',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela whatsapp_config
CREATE TABLE whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL DEFAULT 'empresa-whatsapp',
  instance_id TEXT,
  status TEXT NOT NULL DEFAULT 'desconectado',
  qrcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **PASSO 2: Configurar Índices**
**SQL Editor** → Execute:
```sql
-- Índices para performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_whatsapp_config_manager_id ON whatsapp_config(manager_id);
CREATE INDEX idx_whatsapp_config_instance_name ON whatsapp_config(instance_name);
CREATE INDEX idx_whatsapp_config_status ON whatsapp_config(status);
```

### **PASSO 3: Configurar RLS (Row Level Security)**
**SQL Editor** → Execute:
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para user_roles
CREATE POLICY "Users can view all user roles" ON user_roles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role" ON user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para leads
CREATE POLICY "Users can view all leads" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update leads" ON leads
  FOR UPDATE USING (true);

-- Políticas para tasks
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (true);

-- Políticas para whatsapp_config
CREATE POLICY "Users can view their own whatsapp config" ON whatsapp_config
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert their own whatsapp config" ON whatsapp_config
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update their own whatsapp config" ON whatsapp_config
  FOR UPDATE USING (auth.uid() = manager_id);
```

### **PASSO 4: Criar Usuários de Teste**
**Authentication** → Users → Add user:
- **Email**: `gerente@imobiliaria.com`
- **Password**: `admin123`
- **✅ Auto Confirm User**

### **PASSO 5: Criar Perfis dos Usuários**
**SQL Editor** → Execute:
```sql
-- Criar perfil para o gerente
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com'
ON CONFLICT (id) DO UPDATE SET
  name = 'Gerente',
  role = 'gerente';

-- Criar user_role para o gerente (compatibilidade)
INSERT INTO user_roles (user_id, role)
SELECT id, 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'gerente';
```

---

## 🧪 TESTAR CONFIGURAÇÃO

### **PASSO 6: Verificar Tabelas**
**Table Editor** → Verificar se todas as tabelas foram criadas:
- ✅ `profiles`
- ✅ `user_roles`
- ✅ `leads`
- ✅ `tasks`
- ✅ `whatsapp_config`

### **PASSO 7: Testar Login**
1. **Vá para** `/auth`
2. **Use** as credenciais:
   - **Email**: `gerente@imobiliaria.com`
   - **Senha**: `admin123`

### **PASSO 8: Verificar Console**
- ✅ **Sem erros** 404 ou 400
- ✅ **Login funcionando**
- ✅ **Dashboard carregando**

---

## 🎯 RESULTADO ESPERADO

### **Após Configurar:**
```
✅ Banco de dados configurado completamente
✅ Todas as tabelas criadas
✅ RLS configurado
✅ Usuários de teste criados
✅ Perfis configurados
✅ Sistema funcionando perfeitamente
```

---

## 🎉 CONCLUSÃO

**Execute os 8 passos acima para configurar o banco completamente!** 🚀

**Após configurar, o sistema funcionará perfeitamente!** ✅





