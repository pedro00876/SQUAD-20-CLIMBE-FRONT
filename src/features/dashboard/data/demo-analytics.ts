export interface KpiMetric {
  label: string;
  value: string;
  delta: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface ActivityItem {
  title: string;
  subtitle: string;
  status: string;
}

export const dashboardMetrics: KpiMetric[] = [
  { label: 'Propostas em andamento', value: '18', delta: '+12% na semana', tone: 'positive' },
  { label: 'Documentos pendentes', value: '07', delta: '2 exigem revisão', tone: 'warning' },
  { label: 'Reuniões agendadas', value: '11', delta: '5 para hoje', tone: 'neutral' },
  { label: 'Relatórios entregues', value: '24', delta: '+4 no mês', tone: 'positive' },
];

export const pipelineData: ChartDatum[] = [
  { label: 'Lead', value: 22 },
  { label: 'Proposta', value: 18 },
  { label: 'Docs', value: 13 },
  { label: 'Análise', value: 9 },
  { label: 'Contrato', value: 6 },
];

export const monthlyRevenueData: ChartDatum[] = [
  { label: 'Jan', value: 68 },
  { label: 'Fev', value: 74 },
  { label: 'Mar', value: 82 },
  { label: 'Abr', value: 79 },
  { label: 'Mai', value: 92 },
  { label: 'Jun', value: 98 },
];

export const serviceDistributionData: ChartDatum[] = [
  { label: 'BPO Financeiro', value: 32 },
  { label: 'Valuation', value: 24 },
  { label: 'Contabilidade', value: 18 },
  { label: 'M&A', value: 14 },
  { label: 'CFO as a Service', value: 12 },
];

export const kpiPerformanceData: ChartDatum[] = [
  { label: 'Conversão de propostas', value: 76 },
  { label: 'SLA documental', value: 64 },
  { label: 'Reuniões realizadas', value: 88 },
  { label: 'Entrega de relatórios', value: 71 },
];

export const weeklyAgendaData: ActivityItem[] = [
  {
    title: 'Apresentação de relatório para Grupo Solaris',
    subtitle: 'Hoje, 14:30 - Sala de reunião 02',
    status: 'Confirmada',
  },
  {
    title: 'Validação de documentos da empresa Aurora Capital',
    subtitle: 'Amanhã, 09:00 - Analista responsável',
    status: 'Pendente',
  },
  {
    title: 'Revisão de proposta comercial de BPO Financeiro',
    subtitle: 'Sexta, 11:00 - Time executivo',
    status: 'Em análise',
  },
];

export const reportsTrendData: ChartDatum[] = [
  { label: 'Sem 1', value: 35 },
  { label: 'Sem 2', value: 48 },
  { label: 'Sem 3', value: 51 },
  { label: 'Sem 4', value: 64 },
  { label: 'Sem 5', value: 72 },
  { label: 'Sem 6', value: 81 },
];

export const reportsBreakdownData: ChartDatum[] = [
  { label: 'Financeiro', value: 38 },
  { label: 'Contratos', value: 26 },
  { label: 'Reunioes', value: 20 },
  { label: 'Documentos', value: 16 },
];
