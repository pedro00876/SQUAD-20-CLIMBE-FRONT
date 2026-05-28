import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requirementService, type DocumentRequirement } from '@/features/documentos/services/requirement.service';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, FileText, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: number | null;
}

const documentTypes = [
  { value: 'BALANCO_PATRIMONIAL', label: 'Balanço da Empresa' },
  { value: 'DRE', label: 'Demonstração de Resultados (DRE)' },
  { value: 'PLANILHA_GERENCIAL', label: 'Planilha Gerencial' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'CONTRATO_SOCIAL', label: 'Contrato Social' }
];

export function ChecklistModal({ isOpen, onClose, proposalId }: ChecklistModalProps) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('CNPJ');
  const [deadline, setDeadline] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [validatingReqId, setValidatingReqId] = useState<number | null>(null);

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements', proposalId],
    queryFn: () => requirementService.listByProposal(proposalId!),
    enabled: !!proposalId && isOpen
  });

  const createMutation = useMutation({
    mutationFn: () => requirementService.create(proposalId!, { documentType: selectedType, deadline: deadline || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', proposalId] });
      setDeadline('');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number, status: string, reason?: string }) => 
      requirementService.update(id, { status, rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', proposalId] });
      setValidatingReqId(null);
      setRejectionReason('');
    }
  });

  if (!isOpen || !proposalId) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'APPROVED': return { label: 'Aprovado', color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={14} /> };
      case 'NON_COMPLIANT': return { label: 'Recusado', color: 'text-red-600 bg-red-50', icon: <XCircle size={14} /> };
      case 'SUBMITTED': return { label: 'Em Análise', color: 'text-blue-600 bg-blue-50', icon: <FileText size={14} /> };
      default: return { label: 'Pendente', color: 'text-orange-600 bg-orange-50', icon: <Clock size={14} /> };
    }
  };

  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-climbe-secondary">Checklist Documental</h2>
          <p className="text-xs text-gray-400">Proposta #{proposalId} - Gerencie os documentos exigidos para compliance.</p>
        </div>

        {/* Adicionar Requisito */}
        <form onSubmit={handleCreate} className="flex items-end gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Documento Exigido</Label>
            <select 
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-climbe-primary"
            >
              {documentTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prazo (Opcional)</Label>
            <input 
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-climbe-primary"
            />
          </div>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-4 py-2"
          >
            <Plus size={16} className="mr-1" /> ADICIONAR
          </Button>
        </form>

        {/* Lista de Requisitos */}
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          {isLoading ? (
            <p className="text-center text-sm text-gray-400 py-4">Carregando...</p>
          ) : requirements.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">Nenhum documento exigido ainda.</p>
          ) : (
            requirements.map((req: DocumentRequirement) => {
              const display = getStatusDisplay(req.status);
              
              return (
                <div key={req.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-climbe-secondary">{getTypeLabel(req.documentType)}</h4>
                      <p className="text-[10px] text-gray-400">
                        {req.deadline ? `Prazo: ${format(new Date(req.deadline), 'dd/MM/yyyy')}` : 'Sem prazo'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${display.color}`}>
                      {display.icon} {display.label}
                    </span>
                  </div>

                  {req.status === 'NON_COMPLIANT' && req.rejectionReason && (
                    <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <p>{req.rejectionReason}</p>
                    </div>
                  )}

                  {/* Ações de Validação (Simulação para quando o arquivo for enviado) */}
                  {req.status !== 'APPROVED' && (
                    <div className="pt-3 border-t border-gray-50 flex flex-col gap-2">
                      {validatingReqId === req.id ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Motivo da reprovação..." 
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            className="flex-1 text-xs px-3 py-1.5 border rounded-lg outline-none focus:border-red-400"
                          />
                          <button 
                            onClick={() => updateMutation.mutate({ id: req.id, status: 'NON_COMPLIANT', reason: rejectionReason })}
                            disabled={!rejectionReason || updateMutation.isPending}
                            className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg disabled:opacity-50"
                          >
                            REPROVAR
                          </button>
                          <button onClick={() => setValidatingReqId(null)} className="px-3 py-1.5 text-xs text-gray-500">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateMutation.mutate({ id: req.id, status: 'APPROVED' })}
                            className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Aprovar Doc
                          </button>
                          <button 
                            onClick={() => setValidatingReqId(req.id)}
                            className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Reprovar Doc
                          </button>
                          {req.status === 'PENDING' && (
                            <button 
                              onClick={() => updateMutation.mutate({ id: req.id, status: 'SUBMITTED' })}
                              className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg hover:bg-blue-100 transition-colors"
                              title="Simular envio de documento pelo cliente"
                            >
                              Simular Envio
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
