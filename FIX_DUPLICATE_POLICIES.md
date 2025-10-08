# 🔧 CORRIGIR ERRO - Políticas Duplicadas

## ❌ Erro
```
ERROR: 42710: policy "Users can view all profiles" for table "profiles" already exists
```

## ✅ Solução
**Remover políticas existentes e recriar**

---

## 🚀 CORREÇÃO RÁPIDA

### **1. Remover Políticas Existentes**
**SQL Editor** → Execute:
```sql
-- Remover políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
```

### **2. Recriar Políticas**
**SQL Editor** → Execute:
```sql
-- Recriar políticas para profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **3. Criar Usuário Gerente**
**Authentication** → Users → Add user:
- Email: `gerente@imobiliaria.com`
- Password: `admin123`
- ✅ Auto Confirm User

### **4. Criar Perfil Gerente**
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
✅ Políticas duplicadas removidas
✅ Políticas recriadas
✅ Usuário gerente criado
✅ Perfil gerente configurado
✅ Login funcionando
```

**Execute os 4 passos acima!** 🚀





