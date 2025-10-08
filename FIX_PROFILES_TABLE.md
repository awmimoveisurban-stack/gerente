# 🔧 CORRIGIR ERRO - Tabela profiles não existe

## ❌ Erro
```
ERROR: 42P01: relation "profiles" does not exist
```

## ✅ Solução
**Criar a tabela profiles primeiro**

---

## 🚀 CORREÇÃO RÁPIDA

### **1. Criar Tabela profiles**
**SQL Editor** → Execute:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **2. Criar Usuário Gerente**
**Authentication** → Users → Add user:
- Email: `gerente@imobiliaria.com`
- Password: `admin123`
- ✅ Auto Confirm User

### **3. Criar Perfil Gerente**
**SQL Editor** → Execute:
```sql
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com';
```

---

## ✅ RESULTADO
```
✅ Tabela profiles criada
✅ Usuário gerente criado
✅ Perfil gerente configurado
✅ Login funcionando
```

**Execute os 3 passos acima!** 🚀





