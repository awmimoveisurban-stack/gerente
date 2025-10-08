# 🗄️ CRIAR TABELAS DO BANCO DE DADOS

## ❌ Erro Atual
```
ERROR: 42P01: relation "profiles" does not exist
```

## ✅ Solução
**Criar todas as tabelas necessárias primeiro**

---

## 🔧 CRIAR TABELAS

### **PASSO 1: Acessar SQL Editor**
1. **Supabase Dashboard** → SQL Editor
2. **Execute** as seguintes migrações:

### **PASSO 2: Criar Tabela profiles**
```sql
-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **PASSO 3: Criar Tabela whatsapp_config**
```sql
-- Criar tabela whatsapp_config
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL DEFAULT 'empresa-whatsapp',
  instance_id TEXT,
  status TEXT NOT NULL DEFAULT 'desconectado',
  qrcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_manager_id ON whatsapp_config(manager_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_instance_name ON whatsapp_config(instance_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_status ON whatsapp_config(status);

-- Habilitar RLS
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own whatsapp config" ON whatsapp_config
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert their own whatsapp config" ON whatsapp_config
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update their own whatsapp config" ON whatsapp_config
  FOR UPDATE USING (auth.uid() = manager_id);
```

### **PASSO 4: Criar Tabela leads**
```sql
-- Criar tabela leads
CREATE TABLE IF NOT EXISTS leads (
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all leads" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update leads" ON leads
  FOR UPDATE USING (true);
```

### **PASSO 5: Criar Tabela tasks**
```sql
-- Criar tabela tasks
CREATE TABLE IF NOT EXISTS tasks (
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (true);
```

---

## 🧪 VERIFICAR CRIAÇÃO

### **PASSO 6: Verificar Tabelas**
1. **Vá em** Table Editor
2. **Verifique** se as tabelas foram criadas:
   - ✅ `profiles`
   - ✅ `whatsapp_config`
   - ✅ `leads`
   - ✅ `tasks`

---

## 👤 CRIAR USUÁRIO GERENTE

### **PASSO 7: Criar Usuário**
1. **Authentication** → Users → Add user
2. **Email**: `gerente@imobiliaria.com`
3. **Password**: `admin123`
4. **✅ Auto Confirm User**

### **PASSO 8: Criar Perfil**
```sql
-- Criar perfil para o gerente
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com'
ON CONFLICT (id) DO UPDATE SET
  name = 'Gerente',
  role = 'gerente';
```

---

## 🎯 RESULTADO ESPERADO

### **Após Criar Tabelas:**
```
✅ Tabela profiles criada
✅ Tabela whatsapp_config criada
✅ Tabela leads criada
✅ Tabela tasks criada
✅ RLS configurado
✅ Usuário gerente criado
✅ Perfil gerente configurado
```

---

## 🎉 CONCLUSÃO

**Execute os 8 passos acima para criar todas as tabelas e o usuário gerente!** 🚀

**Após criar as tabelas, o usuário gerente funcionará perfeitamente!** ✅





