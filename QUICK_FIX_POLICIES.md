# ⚡ CORREÇÃO RÁPIDA - Políticas Duplicadas

## ❌ Erro
```
ERROR: 42710: policy "Users can view all profiles" for table "profiles" already exists
```

## ✅ Solução
**Usar IF NOT EXISTS ou DROP primeiro**

---

## 🚀 CORREÇÃO EM 2 PASSOS

### **1. Limpar Políticas**
```sql
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
```

### **2. Criar Usuário e Perfil**
```sql
-- Criar usuário (se não existir)
-- Authentication → Users → Add user
-- Email: gerente@imobiliaria.com
-- Password: admin123

-- Criar perfil
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com'
ON CONFLICT (id) DO UPDATE SET
  name = 'Gerente',
  role = 'gerente';
```

---

## ✅ RESULTADO
```
✅ Políticas limpas
✅ Usuário criado
✅ Perfil configurado
✅ Login funcionando
```

**Execute os 2 passos!** 🚀





