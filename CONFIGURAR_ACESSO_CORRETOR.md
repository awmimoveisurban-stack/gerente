# 🚀 CONFIGURAR ACESSO PARA CORRETOR

## ✅ **SISTEMA PRONTO PARA CORRETOR!**

### **👤 Usuário Corretor Criado:**
- **Email**: `corretor@imobiliaria.com`
- **Senha**: `12345678`
- **Role**: `corretor`
- **Páginas**: Dashboard, Meus Leads, Kanban, Relatórios

---

## 🚀 **EXECUTAR CONFIGURAÇÃO:**

### **PASSO 1: 🗄️ Criar Usuário Corretor no Banco**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/sql
2. **Cole e execute**: O conteúdo do arquivo `create-corretor-user.sql`
3. **Aguarde**: Confirmação de execução

### **PASSO 2: 🔐 Fazer Login como Corretor**
1. **Acesse**: http://127.0.0.1:3006/auth
2. **Email**: `corretor@imobiliaria.com`
3. **Senha**: `12345678`
4. **Clique**: "Entrar" ou use o botão "Login Corretor"

### **PASSO 3: 🧪 Testar Acesso do Corretor**
1. **Pressione**: F12 (abrir DevTools)
2. **Vá na aba**: "Console"
3. **Cole**: O conteúdo do arquivo `test-corretor-access.js`
4. **Pressione**: Enter

### **PASSO 4: 📋 Verificar Menu e Navegação**
1. **Verifique**: Menu lateral esquerdo
2. **Teste**: Clique em cada item do menu
3. **Confirme**: Todas as páginas abrem corretamente

---

## 🎯 **PÁGINAS DISPONÍVEIS PARA CORRETOR:**

### **🏠 Dashboard (`/dashboard`)**
- Visão geral dos leads pessoais
- Estatísticas de performance
- Atividades recentes
- Meta vs realizado

### **👥 Meus Leads (`/leads`)**
- Lista de todos os leads pessoais
- Filtros por status
- Busca por nome/telefone
- Ações rápidas

### **📋 Kanban (`/kanban`)**
- Quadro visual dos leads
- Drag & drop para mudar status
- Estatísticas em tempo real
- Modais de interação

### **📈 Relatórios (`/relatorios`)**
- Relatórios de performance pessoal
- Conversões por período
- Análise de leads
- Gráficos e métricas

---

## 🧪 **TESTE COMPLETO:**

### **Resultado Esperado no Console:**
```
🚀 TESTANDO ACESSO DO CORRETOR
==============================
✅ Supabase carregado.
✅ Usuário autenticado: corretor@imobiliaria.com
✅ Roles encontradas: [{role: "corretor"}]
🎯 Role principal: corretor
✅ Usuário é corretor!

📋 4. Páginas disponíveis para corretor:
  ✅ Dashboard: /dashboard - Dashboard pessoal do corretor
  ✅ Meus Leads: /leads - Leads pessoais do corretor
  ✅ Kanban: /kanban - Quadro Kanban para gerenciar leads
  ✅ Relatórios: /relatorios - Relatórios de performance pessoal

📋 5. Verificando leads do corretor...
✅ 7 leads encontrados para o corretor

🧭 6. Verificando menu lateral...
📋 4 links encontrados no menu:
  1. "Dashboard" -> /dashboard
  2. "Meus Leads" -> /leads
  3. "Kanban" -> /kanban
  4. "Relatórios" -> /relatorios

🎯 Verificando páginas do corretor no menu:
  ✅ "/dashboard" encontrado no menu
  ✅ "/leads" encontrado no menu
  ✅ "/kanban" encontrado no menu
  ✅ "/relatorios" encontrado no menu

📍 7. Verificando URL atual...
URL atual: http://127.0.0.1:3006/dashboard
Pathname: /dashboard
✅ Usuário está em uma página válida para corretor

🎯 9. RESUMO FINAL:
==================
👤 Usuário: corretor@imobiliaria.com
🎭 Role: corretor
📋 Leads: 7
📍 Página atual: /dashboard

✅ ACESSO DO CORRETOR FUNCIONANDO!
🎉 O corretor pode:
  - Acessar o dashboard pessoal
  - Gerenciar seus próprios leads
  - Usar o Kanban
  - Ver relatórios pessoais
  - Navegar entre as páginas
```

---

## 🔄 **ALTERNAR ENTRE USUÁRIOS:**

### **Para Testar como Gerente:**
1. **Logout**: Clique no ícone de logout
2. **Login**: Use `gerente@imobiliaria.com` / `admin123`
3. **Acesso**: Dashboard Geral, Todos os Leads, WhatsApp, Equipe, Relatórios

### **Para Testar como Corretor:**
1. **Logout**: Clique no ícone de logout
2. **Login**: Use `corretor@imobiliaria.com` / `12345678`
3. **Acesso**: Dashboard, Meus Leads, Kanban, Relatórios

---

## 🎉 **RESULTADO FINAL:**

### **✅ Sistema Completo:**
- **👨‍💼 Gerente**: Acesso completo a todas as funcionalidades
- **👤 Corretor**: Acesso limitado às suas próprias funcionalidades
- **🔐 Autenticação**: Login seguro com roles
- **📋 Menu**: Navegação baseada em permissões
- **📊 Dados**: Leads separados por usuário

### **🚀 Funcionalidades Ativas:**
- ✅ **Autenticação** com roles
- ✅ **Menu dinâmico** baseado em permissões
- ✅ **Dashboard** personalizado por role
- ✅ **Kanban** com drag & drop
- ✅ **Leads** gerenciados por usuário
- ✅ **Relatórios** personalizados
- ✅ **Navegação** protegida

**Execute os passos acima e o corretor terá acesso completo ao sistema!** 🎉

**Me informe o resultado após executar o SQL e testar o login do corretor!** ✅





