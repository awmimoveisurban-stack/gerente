import { CorretorPerformance } from '@/hooks/use-corretor-performance';

// =====================================================
// EXPORTAÇÃO DE RELATÓRIOS DE PERFORMANCE
// =====================================================

/**
 * Exporta relatório de performance para CSV
 */
export function exportToCSV(
  performances: CorretorPerformance[],
  filename: string = 'performance_report'
) {
  const headers = [
    'Corretor',
    'Email',
    'Total Leads',
    'Leads Ativos',
    'Leads Convertidos',
    'Leads Perdidos',
    'Taxa de Conversão (%)',
    'Tempo Médio Resposta (min)',
    'Score de Qualidade',
    'Leads Sem Resposta',
    'Valor Total Vendido (R$)',
    'Ticket Médio (R$)',
    'Última Atualização',
  ];

  const rows = performances.map(p => [
    p.corretor_nome,
    p.email,
    p.total_leads,
    p.leads_ativos,
    p.leads_convertidos,
    p.leads_perdidos,
    p.taxa_conversao.toFixed(2),
    p.tempo_medio_primeira_resposta || 'N/A',
    p.score_qualidade || 'N/A',
    p.leads_sem_resposta || 0,
    p.valor_total_vendido.toFixed(2),
    p.ticket_medio.toFixed(2),
    p.stats_atualizadas_em || 'N/A',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta relatório de performance para JSON
 */
export function exportToJSON(
  performances: CorretorPerformance[],
  filename: string = 'performance_report'
) {
  const reportData = {
    gerado_em: new Date().toISOString(),
    total_corretores: performances.length,
    performance_corretores: performances,
    resumo: {
      media_conversao:
        performances.reduce((acc, p) => acc + p.taxa_conversao, 0) /
        performances.length,
      media_score:
        performances.reduce((acc, p) => acc + (p.score_qualidade || 0), 0) /
        performances.length,
      total_leads: performances.reduce((acc, p) => acc + p.total_leads, 0),
      total_convertidos: performances.reduce(
        (acc, p) => acc + p.leads_convertidos,
        0
      ),
      total_vendido: performances.reduce(
        (acc, p) => acc + p.valor_total_vendido,
        0
      ),
    },
  };

  const jsonString = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${filename}_${new Date().toISOString().split('T')[0]}.json`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Gera HTML para impressão ou PDF (via navegador)
 */
export function generatePrintableHTML(
  performances: CorretorPerformance[]
): string {
  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const resumo = {
    total_corretores: performances.length,
    media_conversao: (
      performances.reduce((acc, p) => acc + p.taxa_conversao, 0) /
      performances.length
    ).toFixed(1),
    media_score: (
      performances.reduce((acc, p) => acc + (p.score_qualidade || 0), 0) /
      performances.length
    ).toFixed(0),
    total_leads: performances.reduce((acc, p) => acc + p.total_leads, 0),
    total_convertidos: performances.reduce(
      (acc, p) => acc + p.leads_convertidos,
      0
    ),
    total_vendido: performances.reduce(
      (acc, p) => acc + p.valor_total_vendido,
      0
    ),
  };

  // Ordenar por score
  const sorted = [...performances].sort(
    (a, b) => (b.score_qualidade || 0) - (a.score_qualidade || 0)
  );

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Performance - ${hoje}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      color: #1f2937;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 32px;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .resumo {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .resumo-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .resumo-card h3 {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .resumo-card p {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    thead {
      background: #1e40af;
      color: white;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tbody tr:hover {
      background: #f9fafb;
    }
    .rank {
      display: inline-block;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 50%;
      font-weight: bold;
      font-size: 14px;
    }
    .rank-1 { background: #fbbf24; color: white; }
    .rank-2 { background: #d1d5db; color: white; }
    .rank-3 { background: #f97316; color: white; }
    .score-high { color: #059669; font-weight: bold; }
    .score-mid { color: #f59e0b; font-weight: bold; }
    .score-low { color: #dc2626; font-weight: bold; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório de Performance da Equipe</h1>
    <p>Gerado em: ${hoje}</p>
  </div>

  <div class="resumo">
    <div class="resumo-card">
      <h3>Total de Corretores</h3>
      <p>${resumo.total_corretores}</p>
    </div>
    <div class="resumo-card">
      <h3>Média de Conversão</h3>
      <p>${resumo.media_conversao}%</p>
    </div>
    <div class="resumo-card">
      <h3>Score Médio</h3>
      <p>${resumo.media_score}/100</p>
    </div>
    <div class="resumo-card">
      <h3>Total de Leads</h3>
      <p>${resumo.total_leads}</p>
    </div>
    <div class="resumo-card">
      <h3>Leads Convertidos</h3>
      <p>${resumo.total_convertidos}</p>
    </div>
    <div class="resumo-card">
      <h3>Valor Total Vendido</h3>
      <p>R$ ${(resumo.total_vendido / 1000).toFixed(0)}k</p>
    </div>
  </div>

  <h2 style="margin-bottom: 16px; font-size: 24px;">🏆 Ranking de Corretores</h2>
  
  <table>
    <thead>
      <tr>
        <th>Posição</th>
        <th>Corretor</th>
        <th>Leads</th>
        <th>Ativos</th>
        <th>Convertidos</th>
        <th>Conversão</th>
        <th>Score</th>
        <th>Tempo Resposta</th>
        <th>Valor Vendido</th>
      </tr>
    </thead>
    <tbody>
      ${sorted
        .map((p, index) => {
          const score = p.score_qualidade || 0;
          const scoreClass =
            score >= 80
              ? 'score-high'
              : score >= 60
                ? 'score-mid'
                : 'score-low';
          const rankClass =
            index === 0
              ? 'rank-1'
              : index === 1
                ? 'rank-2'
                : index === 2
                  ? 'rank-3'
                  : '';

          return `
          <tr>
            <td><span class="rank ${rankClass}">${index + 1}</span></td>
            <td><strong>${p.corretor_nome}</strong><br/><small style="color: #6b7280;">${p.email}</small></td>
            <td>${p.total_leads}</td>
            <td>${p.leads_ativos}</td>
            <td>${p.leads_convertidos}</td>
            <td><strong>${p.taxa_conversao}%</strong></td>
            <td class="${scoreClass}">${score}</td>
            <td>${p.tempo_medio_primeira_resposta ? `${Math.round(p.tempo_medio_primeira_resposta)}min` : 'N/A'}</td>
            <td>R$ ${(p.valor_total_vendido / 1000).toFixed(0)}k</td>
          </tr>
        `;
        })
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Urban CRM - Sistema de Gestão de Vendas</p>
    <p>Este relatório é confidencial e destinado apenas ao uso interno</p>
  </div>

  <script>
    // Auto-print após carregar
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
}

/**
 * Abre janela de impressão/PDF
 */
export function printPerformanceReport(performances: CorretorPerformance[]) {
  const html = generatePrintableHTML(performances);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/**
 * Exporta para Excel (usando biblioteca externa via CDN)
 */
export async function exportToExcel(
  performances: CorretorPerformance[],
  filename: string = 'performance_report'
) {
  try {
    // @ts-ignore - Biblioteca externa
    const XLSX = await import(
      'https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs'
    );

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Performance por corretor
    const perfData = performances.map((p, index) => ({
      Posição: index + 1,
      Corretor: p.corretor_nome,
      Email: p.email,
      'Total Leads': p.total_leads,
      'Leads Ativos': p.leads_ativos,
      'Leads Convertidos': p.leads_convertidos,
      'Leads Perdidos': p.leads_perdidos,
      'Taxa de Conversão (%)': p.taxa_conversao,
      'Tempo Médio Resposta (min)': p.tempo_medio_primeira_resposta || 'N/A',
      'Score de Qualidade': p.score_qualidade || 'N/A',
      'Leads Sem Resposta': p.leads_sem_resposta || 0,
      'Valor Total Vendido (R$)': p.valor_total_vendido,
      'Ticket Médio (R$)': p.ticket_medio,
    }));

    const ws1 = XLSX.utils.json_to_sheet(perfData);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Performance');

    // Sheet 2: Resumo geral
    const resumoData = [
      {
        Métrica: 'Total de Corretores',
        Valor: performances.length,
      },
      {
        Métrica: 'Média de Conversão (%)',
        Valor: (
          performances.reduce((acc, p) => acc + p.taxa_conversao, 0) /
          performances.length
        ).toFixed(2),
      },
      {
        Métrica: 'Média de Score',
        Valor: (
          performances.reduce((acc, p) => acc + (p.score_qualidade || 0), 0) /
          performances.length
        ).toFixed(0),
      },
      {
        Métrica: 'Total de Leads',
        Valor: performances.reduce((acc, p) => acc + p.total_leads, 0),
      },
      {
        Métrica: 'Total Convertidos',
        Valor: performances.reduce((acc, p) => acc + p.leads_convertidos, 0),
      },
      {
        Métrica: 'Valor Total Vendido (R$)',
        Valor: performances
          .reduce((acc, p) => acc + p.valor_total_vendido, 0)
          .toFixed(2),
      },
    ];

    const ws2 = XLSX.utils.json_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Resumo');

    // Gerar arquivo
    XLSX.writeFile(
      workbook,
      `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    return true;
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    // Fallback para CSV
    exportToCSV(performances, filename);
    return false;
  }
}



