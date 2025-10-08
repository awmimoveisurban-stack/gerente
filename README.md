# ImobiCRM - Sistema de Gestão de Leads Imobiliários

![ImobiCRM Dashboard](https://img.shields.io/badge/Status-Funcionando-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4)

## 🏠 Sobre o Projeto

O **ImobiCRM** é um sistema completo de gestão de leads imobiliários desenvolvido para corretores e gerentes. A plataforma oferece uma interface moderna e intuitiva para gerenciar todo o pipeline de vendas, desde o primeiro contato até o fechamento do negócio.

## ✨ Funcionalidades

### 👨‍💼 Para Corretores
- **Dashboard Personalizado**: Visão geral dos leads pessoais e métricas de desempenho
- **Gestão de Leads**: Lista completa com filtros avançados por status, data e valor
- **Acompanhamento de Status**: Controle do pipeline (Novo → Em Atendimento → Visita → Proposta → Fechado)
- **Histórico de Interações**: Registro completo de todas as comunicações com clientes
- **Ações Rápidas**: Ligação, email e agendamento de visitas direto da plataforma

### 👩‍💻 Para Gerentes
- **Dashboard Gerencial**: Visão completa da equipe e performance geral
- **Relatórios Avançados**: Análise de conversão, desempenho individual e metas
- **Gestão de Equipe**: Acompanhamento de todos os corretores e seus resultados
- **Métricas em Tempo Real**: Leads novos, visitas agendadas, propostas pendentes
- **Exportação de Dados**: Relatórios em CSV/PDF para análise externa

## 🚀 Como Testar o Sistema

### Acesso Rápido
1. **Acesse**: [Sistema em Produção](https://57131ba4-55d0-40ac-9ef9-0810af33f4b3.lovableproject.com)
2. **Escolha o perfil**:
   - **Corretor**: `corretor@imobiliaria.com` / `123456`
   - **Gerente**: `gerente@imobiliaria.com` / `admin123`

### Fluxo de Teste Recomendado
1. **Login como Corretor** → Explore o dashboard pessoal
2. **Acesse "Meus Leads"** → Veja a lista com filtros
3. **Login como Gerente** → Analise dashboard completo da equipe
4. **Compare as visões** → Entenda as diferenças de permissão

## 🎨 Design System

### Cores Principais
- **Primary Blue**: `#2563eb` - Botões principais e elementos de destaque
- **Success Green**: `#059669` - Leads fechados e métricas positivas
- **Warning Yellow**: `#d97706` - Alertas e leads em acompanhamento
- **Neutral Grays**: Interface limpa e profissional

### Componentes Personalizados
- **StatusBadge**: Indicadores visuais para status dos leads
- **MetricCard**: Cards de métricas com gradientes e trends
- **CRM Cards**: Layout consistente com shadows suaves
- **Professional Layout**: Sidebar colapsível e header fixo

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: TanStack Query para cache
- **Build**: Vite
- **Componentes**: Lucide React (ícones)

## 📊 Estrutura de Dados

### Tabela Leads (Supabase)
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  telefone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  imovel_interesse TEXT,
  data_entrada TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'Novo',
  corretor_id UUID REFERENCES corretores(id),
  observacoes TEXT,
  ultima_interacao TIMESTAMP DEFAULT NOW(),
  valor_interesse DECIMAL
);
```

### Tabela Corretores (Supabase)
```sql
CREATE TABLE corretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  telefone VARCHAR,
  email VARCHAR UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  meta_mensal INTEGER DEFAULT 15
);
```

## 🔗 Próximos Passos

### Integração com Supabase
Para ativar as funcionalidades de backend (autenticação, banco de dados, etc.):

1. **Clique no botão verde "Supabase"** no topo da interface
2. **Conecte sua conta** Supabase
3. **Configure as tabelas** conforme estrutura acima
4. **Ative a autenticação** email/senha
5. **Configure RLS** (Row Level Security) para segurança

### Funcionalidades Futuras
- **Autenticação Real**: Login seguro com Supabase Auth
- **Sincronização de Dados**: Dados reais em tempo real
- **Notificações**: Alertas de novos leads e follow-ups
- **WhatsApp Integration**: Comunicação direta via API
- **Relatórios PDF**: Exportação avançada de relatórios
- **Mobile App**: Versão mobile com Capacitor

## 📱 Layout Responsivo

O sistema foi desenvolvido com **mobile-first**, garantindo excelente experiência em:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Sidebar colapsível e navegação otimizada  
- **Mobile**: Interface touch-friendly com navegação simplificada

## 🎯 Métricas e KPIs

### Corretor Individual
- Taxa de conversão pessoal
- Número de leads ativos
- Valor médio por negócio
- Tempo médio de conversão

### Visão Gerencial
- Performance da equipe
- Leads por fonte
- Comparativo mensal
- Ranking de corretores

---

**ImobiCRM** - *Transformando leads em vendas*

Para suporte ou dúvidas sobre implementação, consulte a [documentação completa](https://docs.lovable.dev/) ou acesse nossa [comunidade no Discord](https://discord.com/channels/1119885301872070706/1280461670979993613).