# ⚡ CORREÇÃO RÁPIDA - Banco de Dados

## ❌ Erros
- **404**: Tabela `user_roles` não existe
- **400**: Consulta `profiles` com coluna incorreta

## ✅ Solução Rápida

---

## 🚀 CORREÇÃO EM 3 PASSOS

### **1. Criar Tabelas**
**SQL Editor** → Execute:
```sql
-- Remover tabelas existentes
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Criar profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar user_roles
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all user roles" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own role" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own role" ON user_roles FOR UPDATE USING (auth.uid() = user_id);
```

### **2. Criar Usuário**
**Authentication** → Users → Add user:
- Email: `gerente@imobiliaria.com`
- Password: `admin123`
- ✅ Auto Confirm User

### **3. Criar Perfil**
**SQL Editor** → Execute:
```sql
-- Criar perfil
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com';

-- Criar user_role
INSERT INTO user_roles (user_id, role)
SELECT id, 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com';
```

---

## ✅ RESULTADO
```
✅ Tabelas criadas
✅ Usuário criado
✅ Perfil configurado
✅ Login funcionando
```

**Execute os 3 passos!** 🚀





