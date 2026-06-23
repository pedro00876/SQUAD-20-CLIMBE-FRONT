export interface WorkflowApiError {
  message: string;
  hint?: string;
}

function extractMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return 'Não foi possível concluir a ação.';
}

export function parseApiWorkflowError(error: unknown): WorkflowApiError {
  const message = extractMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes('transição de status inválida') || lower.includes('transicao de status invalida')) {
    return {
      message,
      hint: 'Use a ação correta do fluxo: envie o documento comercial ou assine o contrato em vez de alterar o status manualmente.',
    };
  }

  if (lower.includes('dados iniciais incompletos') || lower.includes('incompletos')) {
    return {
      message,
      hint: 'Edite o cadastro da empresa e preencha todos os campos obrigatórios antes de aprovar a triagem.',
    };
  }

  if (lower.includes('rejectionreason') || lower.includes('motivo')) {
    return {
      message,
      hint: 'Informe o motivo da reprovação antes de confirmar.',
    };
  }

  if (lower.includes('commercial_proposal') || lower.includes('proposta comercial')) {
    return {
      message,
      hint: 'Envie o PDF da proposta comercial para avançar esta etapa.',
    };
  }

  return { message };
}
