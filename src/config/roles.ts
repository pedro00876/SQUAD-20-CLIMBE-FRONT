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

  if (role === 'CEO' || role === 'ADMINISTRADOR' || role === 'ADMIN') {
    return ['ADMIN', 'APROVADOR', 'SENIOR', 'COMPLIANCE', 'ANALISTA']; // Pode fazer tudo
  }
  
  if (role === 'GERENTE') {
    return ['SENIOR', 'APROVADOR', 'COMPLIANCE'];
  }
  
  if (role === 'COLABORADOR') {
    return ['ANALISTA'];
  }

  // Fallback padrão se não bater com nenhum (ou se for empresa cliente)
  if (role === 'EMPRESA') {
    return ['EMPRESA'];
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
