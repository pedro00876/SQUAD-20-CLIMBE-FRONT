// src/config/permissions.ts
// Permissões baseadas nas roles reais do backend (enum Role)

export type BackendRole =
  | 'COMPLIANCE'
  | 'CEO'
  | 'MEMBRO_CONSELHO'
  | 'CSO'
  | 'CMO'
  | 'CFO'
  | 'CONTADOR'
  | 'ANALISTA_CHEFE'
  | 'ANALISTA_SENIOR'
  | 'ANALISTA'
  | 'ANALISTA_VI_TRAINEE'
  | 'ANALISTA_VI_JUNIOR'
  | 'ANALISTA_VI_PLENO'
  | 'ANALISTA_VI_SENIOR'
  | 'ANALISTA_BPO_FINANCEIRO';

/** Roles com acesso administrativo (gerenciar usuários, aprovar acessos) */
export const ADMIN_ROLES: BackendRole[] = ['CEO'];

/** Roles que podem criar/atualizar empresas */
export const EMPRESA_MANAGE_ROLES: BackendRole[] = [
  'CEO', 'CMO', 'CSO', 'COMPLIANCE', 'ANALISTA_CHEFE',
];

/** Roles que podem criar/gerenciar propostas */
export const PROPOSTA_MANAGE_ROLES: BackendRole[] = ['CMO', 'CEO'];

/** Roles que podem aprovar propostas comerciais */
export const PROPOSTA_APPROVE_ROLES: BackendRole[] = [
  'CMO', 'CSO', 'CEO', 'CONTADOR',
];

/** Roles que podem criar contratos */
export const CONTRATO_CREATE_ROLES: BackendRole[] = ['COMPLIANCE', 'CEO'];

/** Roles que podem elencar analistas em contratos */
export const CONTRATO_ASSIGN_ROLES: BackendRole[] = ['CEO', 'ANALISTA_CHEFE'];

/** Roles que podem solicitar e validar documentos */
export const DOCUMENTACAO_ROLES: BackendRole[] = [
  'ANALISTA_CHEFE', 'ANALISTA_SENIOR', 'ANALISTA', 'CEO',
];

/** Roles que podem validar (aprovar/reprovar) documentos */
export const VALIDACAO_ROLES: BackendRole[] = [
  'ANALISTA_CHEFE', 'ANALISTA_SENIOR', 'CEO',
];

/** Roles que podem liberar ferramentas (Primeira Data) */
export const FERRAMENTAS_ROLES: BackendRole[] = [
  'ANALISTA_CHEFE', 'ANALISTA_SENIOR', 'CEO',
];

/** Roles que podem criar relatórios */
export const RELATORIO_CREATE_ROLES: BackendRole[] = [
  'ANALISTA', 'ANALISTA_VI_JUNIOR', 'ANALISTA_VI_PLENO', 'ANALISTA_VI_SENIOR',
  'ANALISTA_VI_TRAINEE', 'ANALISTA_BPO_FINANCEIRO', 'ANALISTA_SENIOR', 'ANALISTA_CHEFE', 'CEO',
];

/** Roles que podem aprovar relatórios */
export const RELATORIO_APPROVE_ROLES: BackendRole[] = [
  'ANALISTA_SENIOR', 'ANALISTA_CHEFE', 'CEO',
];

/** Roles que podem tomar decisão de aprovação final */
export const APROVACAO_FINAL_ROLES: BackendRole[] = ['CEO', 'ANALISTA_CHEFE'];

export const hasPermission = (userRole: string | undefined, allowedRoles: BackendRole[]): boolean => {
  if (!userRole) return false;
  return (allowedRoles as string[]).includes(userRole.toUpperCase());
};
