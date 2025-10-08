# 🚀 CRIAR GERENTE RAPIDAMENTE

## 👤 Usuário Gerente
- **Email**: `gerente@imobiliaria.com`
- **Senha**: `admin123`
- **Role**: `gerente`

---

## 🔧 PASSOS RÁPIDOS

### **1. Criar Usuário**
1. **Supabase Dashboard** → Authentication → Users
2. **Add user**:
   - Email: `gerente@imobiliaria.com`
   - Password: `admin123`
   - ✅ Auto Confirm User
3. **Create user**

### **2. Criar Perfil**
1. **SQL Editor** → Execute:
```sql
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com'
ON CONFLICT (id) DO UPDATE SET
  name = 'Gerente',
  role = 'gerente';
```

### **3. Testar Login**
1. **Frontend** → `/auth`
2. **Login**:
   - Email: `gerente@imobiliaria.com`
   - Senha: `admin123`

---

## ✅ RESULTADO
```
✅ Usuário criado
✅ Perfil configurado
✅ Login funcionando
✅ Acesso ao dashboard
```

**Execute os 3 passos acima!** 🚀
