import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// 🎨 CORES PARA GRÁFICOS
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
];

// 📊 GRÁFICO DE LEADS POR STATUS
interface LeadsByStatusProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  loading?: boolean;
}

export const LeadsByStatusChart: React.FC<LeadsByStatusProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads por Status</CardTitle>
          <CardDescription>Distribuição dos leads por status atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads por Status</CardTitle>
        <CardDescription>Distribuição dos leads por status atual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  `${value} leads (${data.find(d => d.status === name)?.percentage}%)`,
                  'Quantidade'
                ]}
              />
              <Bar 
                dataKey="count" 
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// 📈 GRÁFICO DE PERFORMANCE DOS CORRETORES
interface CorretorPerformanceProps {
  data: Array<{
    nome: string;
    leads: number;
    fechados: number;
    taxa: number;
    valor: number;
  }>;
  loading?: boolean;
}

export const CorretorPerformanceChart: React.FC<CorretorPerformanceProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Corretores</CardTitle>
          <CardDescription>Leads e taxa de conversão por corretor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance dos Corretores</CardTitle>
        <CardDescription>Leads e taxa de conversão por corretor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="nome" 
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  name === 'leads' ? `${value} leads` : 
                  name === 'fechados' ? `${value} fechados` :
                  name === 'taxa' ? `${value}%` : `R$ ${value.toLocaleString('pt-BR')}`,
                  name === 'leads' ? 'Total Leads' :
                  name === 'fechados' ? 'Fechados' :
                  name === 'taxa' ? 'Taxa Conversão' : 'Valor Total'
                ]}
              />
              <Bar dataKey="leads" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="fechados" fill={COLORS.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// 🥧 GRÁFICO DE LEADS POR ORIGEM
interface LeadsByOriginProps {
  data: Array<{
    origem: string;
    count: number;
    percentage: number;
  }>;
  loading?: boolean;
}

export const LeadsByOriginChart: React.FC<LeadsByOriginProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads por Origem</CardTitle>
          <CardDescription>Distribuição dos leads por origem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads por Origem</CardTitle>
        <CardDescription>Distribuição dos leads por origem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ origem, percentage }) => `${origem}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  `${value} leads (${data.find(d => d.origem === name)?.percentage}%)`,
                  'Quantidade'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// 📈 GRÁFICO DE CONVERSÃO POR PERÍODO
interface ConversionTrendProps {
  data: Array<{
    periodo: string;
    leads: number;
    fechados: number;
    taxa: number;
  }>;
  loading?: boolean;
}

export const ConversionTrendChart: React.FC<ConversionTrendProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Conversão</CardTitle>
          <CardDescription>Evolução da taxa de conversão ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Conversão</CardTitle>
        <CardDescription>Evolução da taxa de conversão ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  name === 'leads' ? `${value} leads` : 
                  name === 'fechados' ? `${value} fechados` : `${value}%`,
                  name === 'leads' ? 'Total Leads' :
                  name === 'fechados' ? 'Fechados' : 'Taxa Conversão'
                ]}
              />
              <Area
                type="monotone"
                dataKey="taxa"
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// 📊 GRÁFICO DE VALOR POR PERÍODO
interface ValueTrendProps {
  data: Array<{
    periodo: string;
    valor: number;
    leads: number;
    ticketMedio: number;
  }>;
  loading?: boolean;
}

export const ValueTrendChart: React.FC<ValueTrendProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Valor</CardTitle>
          <CardDescription>Valor total e ticket médio por período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Valor</CardTitle>
        <CardDescription>Valor total e ticket médio por período</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  name === 'valor' ? `R$ ${value.toLocaleString('pt-BR')}` : 
                  name === 'ticketMedio' ? `R$ ${value.toLocaleString('pt-BR')}` : `${value}`,
                  name === 'valor' ? 'Valor Total' :
                  name === 'ticketMedio' ? 'Ticket Médio' : 'Leads'
                ]}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.success, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="ticketMedio"
                stroke={COLORS.warning}
                strokeWidth={2}
                dot={{ fill: COLORS.warning, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: COLORS.warning, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

