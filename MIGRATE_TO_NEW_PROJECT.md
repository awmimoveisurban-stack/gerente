# 🔄 MIGRAR PARA NOVO PROJETO SUPABASE

## 📊 Status Atual
- ✅ **Novo Projeto**: `bxtuynqauqasigcbocbm`
- ✅ **Credenciais**: Configuradas
- 🔄 **Próximo**: Executar migrações

---

## 🗄️ EXECUTAR MIGRAÇÕES

### **PASSO 1: Executar Migrações SQL**
1. **Acesse**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Selecione** o projeto `bxtuynqauqasigcbocbm`
3. **Vá em** SQL Editor
4. **Execute** as seguintes migrações:

#### **Migração 1: Tabela whatsapp_config**
```sql
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
```

#### **Migração 2: Tabela leads**
```sql
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
```

#### **Migração 3: Tabela tasks**
```sql
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
```

#### **Migração 4: Tabela profiles**
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Migração 5: RLS (Row Level Security)**
```sql
-- Habilitar RLS
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_config
CREATE POLICY "Users can view their own whatsapp config" ON whatsapp_config
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert their own whatsapp config" ON whatsapp_config
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update their own whatsapp config" ON whatsapp_config
  FOR UPDATE USING (auth.uid() = manager_id);

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

-- Políticas para profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 👥 CRIAR USUÁRIOS DE TESTE

### **PASSO 2: Criar Usuários**
1. **Vá em** Authentication → Users
2. **Crie** os seguintes usuários:

#### **Usuário Gerente:**
- **Email**: `gerente@imobiliaria.com`
- **Senha**: `admin123`
- **Confirmar email**: Sim

#### **Usuário Corretor:**
- **Email**: `corretor@imobiliaria.com`
- **Senha**: `12345678`
- **Confirmar email**: Sim

### **PASSO 3: Criar Perfis**
1. **Vá em** SQL Editor
2. **Execute**:

```sql
-- Criar perfil para gerente
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com';

-- Criar perfil para corretor
INSERT INTO profiles (id, name, role)
SELECT id, 'Corretor', 'corretor'
FROM auth.users
WHERE email = 'corretor@imobiliaria.com';
```

---

## 🔧 CONFIGURAR EDGE FUNCTIONS

### **PASSO 4: Configurar Environment Variables**
1. **Vá em** Edge Functions → Settings
2. **Adicione** as variáveis:

```env
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **PASSO 5: Criar Edge Function whatsapp-simple**
1. **Criar** função `whatsapp-simple`
2. **Copiar** código do arquivo `index.ts`
3. **Deploy**

---

## 🧪 TESTAR MIGRAÇÃO

### **PASSO 6: Testar Sistema**
1. **Atualizar** `.env` local
2. **Recarregar** servidor
3. **Testar** login com usuários criados
4. **Testar** Edge Function
5. **Testar** conexão WhatsApp

---

## 🎯 RESULTADO ESPERADO

### **Após Migração:**
```
✅ Banco de dados configurado
✅ Usuários de teste criados
✅ Edge Functions configuradas
✅ Sistema funcionando
✅ WhatsApp conectando
```

---

## 🎉 CONCLUSÃO

**Migração para novo projeto Supabase completa!**

**Execute os 6 passos acima para migrar completamente!** 🚀

**Após migrar, o sistema funcionará perfeitamente!** ✅





