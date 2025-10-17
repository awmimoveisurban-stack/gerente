# 🏢 Supabuild Deals CRM

Sistema completo de CRM para gestão de leads e equipe de vendas, desenvolvido com React, TypeScript, Supabase e Tailwind CSS.

## 🚀 Funcionalidades

### 👨‍💼 **Dashboard Gerente**
- Visão geral de métricas e KPIs
- Gestão completa de leads
- Controle de equipe (corretores)
- Relatórios de performance
- Integração WhatsApp via Evolution API

### 👨‍💻 **Dashboard Corretor**
- Visualização de leads atribuídos
- Sistema de tarefas e follow-ups
- Relatórios individuais
- Interface otimizada para vendas

### 📊 **Gestão de Leads**
- CRUD completo de leads
- Sistema de status (Novo, Contatado, Interessado, Convertido)
- Filtros avançados e busca
- Timeline de interações
- Sistema de pontuação com IA

### 📱 **Integração WhatsApp**
- Conexão com Evolution API
- Envio de mensagens automáticas
- QR Code para autenticação
- Status de conexão em tempo real

### 🎯 **Sistema Kanban**
- Visualização de leads por status
- Drag & drop para mudança de status
- Métricas por coluna
- Alertas de gargalos

### 🔐 **Autenticação Segura**
- Login diferenciado (Gerente vs Corretor)
- Sistema de roles e permissões
- Sessões seguras com expiração
- Auditoria de ações

## 🛠️ Tecnologias

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **UI:** Shadcn/ui, Framer Motion, Lucide Icons
- **Estado:** Zustand, React Query
- **Deploy:** Vercel
- **WhatsApp:** Evolution API

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/supabuild-deals-crm.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Evolution API (WhatsApp)
VITE_EVOLUTION_API_URL=sua_url_evolution
VITE_EVOLUTION_API_KEY=sua_chave_evolution
VITE_EVOLUTION_INSTANCE_NAME=nome_da_instancia

# Claude AI (Opcional)
VITE_CLAUDE_API_KEY=sua_chave_claude
```

### Banco de Dados

Execute as migrações do Supabase:

```bash
# Instale o CLI do Supabase
npm install -g supabase

# Execute as migrações
supabase db push
```

## 🚀 Deploy

### Vercel

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente no Vercel

Configure as seguintes variáveis no painel do Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EVOLUTION_API_URL`
- `VITE_EVOLUTION_API_KEY`
- `VITE_EVOLUTION_INSTANCE_NAME`

## 📱 Uso

### Login Gerente
- **Email:** cursos30.click@gmail.com
- **Senha:** admin123

### Login Corretor
- Acesse `/corretor-login`
- Use as credenciais fornecidas pelo gerente

## 🎯 Rotas Principais

- `/` - Página inicial
- `/auth` - Login gerente
- `/corretor-login` - Login corretor
- `/gerente` - Dashboard gerente
- `/todos-leads` - Gestão de leads
- `/gerente-equipe` - Gestão de equipe
- `/kanban` - Visualização Kanban
- `/whatsapp` - Integração WhatsApp

## 🔧 Scripts

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── crm/            # Componentes específicos do CRM
│   ├── layout/          # Layout e navegação
│   └── ui/              # Componentes de UI base
├── pages/               # Páginas da aplicação
├── hooks/               # Hooks customizados
├── contexts/            # Contextos React
├── lib/                 # Bibliotecas e utilitários
├── utils/               # Funções utilitárias
└── config/              # Configurações
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através de:
- Email: cursos30.click@gmail.com
- Issues do GitHub

---

**Desenvolvido com ❤️ para otimizar vendas e gestão de leads**
