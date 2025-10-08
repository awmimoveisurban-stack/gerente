# 🔧 CORRIGIR ERROS DE SCHEMA DO BANCO

## ❌ Erros Identificados
1. **Tabela não existe**: `user_roles` não foi encontrada
2. **Coluna não existe**: `profiles.user_id` não existe (deveria ser `id`)

## ✅ Solução
**Corrigir schema do banco de dados**

---

## 🔧 CORREÇÕES NECESSÁRIAS

### **1. Corrigir Tabela profiles**
**SQL Editor** → Execute:
```sql
-- Remover tabela profiles se existir
DROP TABLE IF EXISTS profiles CASCADE;

-- Recriar tabela profiles com schema correto
CREATE TABLE profiles (
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

### **2. Criar Tabela user_roles (se necessário)**
**SQL Editor** → Execute:
```sql
-- Criar tabela user_roles (alternativa para roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all user roles" ON user_roles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role" ON user_roles
  FOR UPDATE USING (auth.uid() = user_id);
```

### **3. Criar Usuário Gerente**
**Authentication** → Users → Add user:
- Email: `gerente@imobiliaria.com`
- Password: `admin123`
- ✅ Auto Confirm User

### **4. Criar Perfil do Gerente**
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
```

---

## 🧪 TESTAR CORREÇÕES

### **1. Verificar Tabelas**
**Table Editor** → Verificar:
- ✅ `profiles` existe
- ✅ `user_roles` existe (se criada)

### **2. Testar Login**
1. **Vá para** `/auth`
2. **Use** as credenciais:
   - **Email**: `gerente@imobiliaria.com`
   - **Senha**: `admin123`

### **3. Verificar Console**
- ✅ **Sem erros** de tabela não encontrada
- ✅ **Sem erros** de coluna não encontrada
- ✅ **Login funcionando**

---

## 🎯 RESULTADO ESPERADO

### **Após Corrigir:**
```
✅ Tabela profiles com schema correto
✅ Tabela user_roles criada (se necessária)
✅ Usuário gerente criado
✅ Perfil gerente configurado
✅ Login funcionando
✅ Sem erros de schema
```

---

## 🎉 CONCLUSÃO

**Execute os 4 passos acima para corrigir os erros de schema!** 🚀

**Após corrigir, o sistema funcionará perfeitamente!** ✅





