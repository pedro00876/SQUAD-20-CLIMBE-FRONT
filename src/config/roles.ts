// src/config/roles.ts

/**
 * Mapeamento de papéis lógicos exigidos pelo sistema BPMN
 * CPO e P5 do fluxo de negócio não existem no enum do backend:
 *   CPO → CEO
 *   P5  → ANALISTA_CHEFE
 */
export type LogicalRole =
  | 'ADMIN'
  | 'SENIOR'
  | 'ANALISTA'
  | 'COMPLIANCE'
  | 'APROVADOR'
  | 'EMPRESA'
  | 'CPO'
  | 'P5';

export const mapBackendRoleToLogicalRoles = (backendRole?: string): LogicalRole[] => {
  const role = backendRole?.toUpperCase() || '';

  if (role === 'CEO') {
    return ['ADMIN', 'APROVADOR', 'SENIOR', 'COMPLIANCE', 'ANALISTA', 'CPO'];
  }

  if (
    role === 'CMO' ||
    role === 'CFO' ||
    role === 'CSO' ||
    role === 'MEMBRO_CONSELHO'
  ) {
    return ['SENIOR', 'APROVADOR'];
  }

  if (role === 'ANALISTA_CHEFE') {
    return ['SENIOR', 'APROVADOR', 'P5'];
  }

  if (role === 'COMPLIANCE') {
    return ['COMPLIANCE', 'SENIOR'];
  }

  if (role === 'CONTADOR') {
    return ['SENIOR', 'APROVADOR'];
  }

  if (
    role === 'ANALISTA_SENIOR' ||
    role === 'ANALISTA_VI_SENIOR' ||
    role === 'ANALISTA_VI_PLENO'
  ) {
    return ['ANALISTA', 'SENIOR'];
  }

  if (
    role === 'ANALISTA' ||
    role === 'ANALISTA_VI_JUNIOR' ||
    role === 'ANALISTA_VI_TRAINEE' ||
    role === 'ANALISTA_BPO_FINANCEIRO'
  ) {
    return ['ANALISTA'];
  }

  return [];
};

export const hasLogicalRole = (backendRole: string | undefined, logicalRole: LogicalRole): boolean => {
  return mapBackendRoleToLogicalRoles(backendRole).includes(logicalRole);
};

export const hasAnyLogicalRole = (backendRole: string | undefined, requiredRoles: LogicalRole[]): boolean => {
  const userLogicalRoles = mapBackendRoleToLogicalRoles(backendRole);
  return requiredRoles.some((role) => userLogicalRoles.includes(role));
};

// ─── Permissões por stage do pipeline ────────────────────────────────────────

/** Backend roles que podem executar ações em cada etapa */
export const STAGE_PERMISSIONS = {
  REUNIAO_CRIAR: ['CMO', 'CEO'],
  PROPOSTA_UPLOAD: ['CMO', 'CEO'],
  PROPOSTA_APROVAR: ['CMO', 'CSO', 'CEO', 'CONTADOR'],
  CONTRATO_CRIAR: ['COMPLIANCE', 'CEO'],
  CONTRATO_ANALISTA: ['CEO', 'ANALISTA_CHEFE'],
  DOCUMENTACAO_SOLICITAR: ['ANALISTA_CHEFE', 'ANALISTA_SENIOR', 'ANALISTA', 'CEO'],
  DOCUMENTACAO_VALIDAR: ['ANALISTA_CHEFE', 'ANALISTA_SENIOR', 'CEO'],
  FERRAMENTAS_LIBERAR: ['ANALISTA_CHEFE', 'ANALISTA_SENIOR', 'CEO'],
  RELATORIO_CRIAR: ['ANALISTA', 'ANALISTA_SENIOR', 'ANALISTA_CHEFE', 'CEO'],
  RELATORIO_APROVAR: ['ANALISTA_SENIOR', 'ANALISTA_CHEFE', 'CEO'],
  APROVACAO_FINAL: ['CEO', 'ANALISTA_CHEFE'],
} as const;

export type StagePermissionKey = keyof typeof STAGE_PERMISSIONS;

export const canPerformStageAction = (
  backendRole: string | undefined,
  action: StagePermissionKey
): boolean => {
  if (!backendRole) return false;
  return (STAGE_PERMISSIONS[action] as readonly string[]).includes(backendRole.toUpperCase());
};
