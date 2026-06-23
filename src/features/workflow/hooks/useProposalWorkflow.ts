import { useCallback } from 'react';
import { parseApiWorkflowError } from '../api-errors';

export function useProposalWorkflow() {
  const handleWorkflowError = useCallback((error: unknown) => {
    return parseApiWorkflowError(error);
  }, []);

  return { handleWorkflowError, parseApiWorkflowError };
}
