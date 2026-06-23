import type { CreateEnterpriseRequest } from '@/services/enterprise.service';

export interface EnterpriseValidationIssue {
  field: string;
  label: string;
}

export function validateEnterpriseForEligible(
  enterprise: Partial<CreateEnterpriseRequest> | null | undefined,
): EnterpriseValidationIssue[] {
  if (!enterprise) {
    return [{ field: 'enterprise', label: 'Dados da empresa não encontrados' }];
  }

  const issues: EnterpriseValidationIssue[] = [];
  const addr = enterprise.address;

  if (!enterprise.legalName?.trim()) {
    issues.push({ field: 'legalName', label: 'Razão social' });
  }
  if (!enterprise.cnpj?.trim()) {
    issues.push({ field: 'cnpj', label: 'CNPJ' });
  }
  if (!enterprise.email?.trim()) {
    issues.push({ field: 'email', label: 'E-mail' });
  }
  if (!enterprise.phone?.trim()) {
    issues.push({ field: 'phone', label: 'Telefone' });
  }
  if (!enterprise.representativeName?.trim()) {
    issues.push({ field: 'representativeName', label: 'Nome do representante' });
  }
  if (!addr?.street?.trim()) {
    issues.push({ field: 'street', label: 'Logradouro' });
  }
  if (!addr?.number?.trim()) {
    issues.push({ field: 'number', label: 'Número' });
  }
  if (!addr?.neighborhood?.trim()) {
    issues.push({ field: 'neighborhood', label: 'Bairro' });
  }
  if (!addr?.city?.trim()) {
    issues.push({ field: 'city', label: 'Cidade' });
  }
  if (!addr?.state?.trim()) {
    issues.push({ field: 'state', label: 'UF' });
  }
  if (!addr?.zipCode?.trim()) {
    issues.push({ field: 'zipCode', label: 'CEP' });
  }

  return issues;
}

export function formatEnterpriseValidationMessage(
  issues: EnterpriseValidationIssue[],
): string {
  if (issues.length === 0) return '';
  const fields = issues.map((i) => i.label).join(', ');
  return `Complete os dados da empresa antes de aprovar a triagem: ${fields}.`;
}
