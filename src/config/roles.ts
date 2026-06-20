// src/config/roles.ts

/**
 * Mapeamento de papéis lógicos exigidos pelo sistema BPMN
 */
export type LogicalRole = 'ADMIN' | 'SENIOR' | 'ANALISTA' | 'COMPLIANCE' | 'APROVADOR' | 'EMPRESA';

/**
 * Mapeia os cargos/roles que vêm do backend para os papéis lógicos do frontend.
 * Como o backend não mudou, precisamos inferir os papéis do BPMN a partir dos papéis existentes (CEO, GERENTE, COLABORADOR, ADMINISTRADOR).
 *
 * Exemplo de mapeamento sugerido (ajustável):
 * - CEO / ADMINISTRADOR -> ADMIN, APROVADOR, SENIOR
 * - GERENTE -> SENIOR, APROVADOR, COMPLIANCE
 * - COLABORADOR -> ANALISTA
 */
export const mapBackendRoleToLogicalRoles = (backendRole?: string): LogicalRole[] => {
  const role = backendRole?.toUpperCase() || '';

  if (role === 'CEO') {
    return ['ADMIN', 'APROVADOR', 'SENIOR', 'COMPLIANCE', 'ANALISTA'];
  }

  if (
    role === 'CMO' ||
    role === 'CFO' ||
    role === 'CSO' ||
    role === 'MEMBRO_CONSELHO' ||
    role === 'ANALISTA_CHEFE'
  ) {
    return ['SENIOR', 'APROVADOR'];
  }

  if (role === 'COMPLIANCE') {
    return ['COMPLIANCE', 'SENIOR'];
  }

  if (role === 'CONTADOR') {
    return ['SENIOR'];
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

/**
 * Verifica se um papel de backend possui um determinado papel lógico
 */
export const hasLogicalRole = (backendRole: string | undefined, logicalRole: LogicalRole): boolean => {
  const logicalRoles = mapBackendRoleToLogicalRoles(backendRole);
  return logicalRoles.includes(logicalRole);
};

/**
 * Verifica se um papel de backend possui PELO MENOS UM dos papéis lógicos informados
 */
export const hasAnyLogicalRole = (backendRole: string | undefined, requiredRoles: LogicalRole[]): boolean => {
  const userLogicalRoles = mapBackendRoleToLogicalRoles(backendRole);
  return requiredRoles.some((role) => userLogicalRoles.includes(role));
};
