import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollText, User, Calendar, CheckCircle2, Loader2, Mail, PenLine, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Tooltip } from '@/components/ui/Tooltip';
import { contractService } from '@/services/contract.service';
import { proposalService } from '@/services/proposal.service';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';
import { parseApiWorkflowError, canCreateContract, canAssignAnalyst } from '@/features/workflow';
import type { Contract } from '@/features/contracts/types';

interface StageContratoProps {
  empresa: any;
  proposal: any;
  contract?: Contract | null;
  canCreate: boolean;
  canAssignAnalystRole: boolean;
  onConcluir: () => void;
}

function isContractSigned(contract?: Contract | null): boolean {
  return contract?.status?.toUpperCase() === 'DIGITALLY_SIGNED';
}

export function StageContrato({
  empresa,
  proposal,
  contract,
  canCreate,
  canAssignAnalystRole,
  onConcluir,
}: StageContratoProps) {
  const queryClient = useQueryClient();
  const [dataInicio, setDataInicio] = useState('');
  const [analistaId, setAnalistaId] = useState('');
  const [error, setError] = useState('');
  const [contratoCriado, setContratoCriado] = useState(!!contract);
  const [notifiedAnalyst, setNotifiedAnalyst] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const proposalStatus = (proposal?.status || '').toUpperCase();
  const mayCreateContract = canCreateContract(proposalStatus) && !contract;
  const mayAssignAnalyst = canAssignAnalyst(proposalStatus);
  const pendingSignature = contract && !isContractSigned(contract);

  const { data: usersPage } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => userService.listUsers(0, 100),
  });

  const analysts = (usersPage?.content || []).filter((u: any) =>
    u.role && u.role.toUpperCase().includes('ANALISTA'),
  );

  const selectedAnalyst = analysts.find((u: any) => u.id === Number(analistaId));

  const contratoMutation = useMutation({
    mutationFn: async () => {
      if (!mayCreateContract) {
        throw new Error('Contrato só pode ser criado quando a proposta está aprovada comercialmente.');
      }

      const contrato = await contractService.create({
        proposalId: proposal.id,
        startDate: dataInicio || undefined,
      });

      if (analistaId && mayAssignAnalyst) {
        await proposalService.update(proposal.id, {
          responsibleAnalystId: Number(analistaId),
        });

        const analista = analysts.find((u: any) => u.id === Number(analistaId));
        if (analista?.email) {
          await notificationService.sendEmail(
            analista.email,
            `Você foi selecionado como analista responsável — ${empresa.tradeName || empresa.legalName}`,
            `Olá, ${analista.fullName || 'analista'}. Você foi elencado como responsável pelo contrato #${contrato.id} da empresa ${empresa.tradeName || empresa.legalName}. Acesse o sistema para mais detalhes.`,
          );
          setNotifiedAnalyst(true);
        }
      }

      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Contrato gerado — ${empresa.tradeName || empresa.legalName}`,
          `Seu contrato foi gerado com sucesso. Acesse Contratos no sistema para assinar digitalmente.`,
        );
      }
    },
    onSuccess: () => {
      setContratoCriado(true);
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['contracts-proposal', proposal.id] });
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onConcluir();
    },
    onError: (err: unknown) => {
      const parsed = parseApiWorkflowError(err);
      setError(parsed.hint ? `${parsed.message} ${parsed.hint}` : parsed.message);
      setShowConfirm(false);
    },
  });

  if (isContractSigned(contract)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <h3 className="text-2xl font-black italic text-green-700">Contrato Assinado</h3>
        <p className="text-green-600/80 max-w-md text-sm">
          A proposta avançou automaticamente para a próxima etapa após a assinatura digital.
        </p>
        <Button onClick={onConcluir} className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8">
          CONTINUAR PARA DOCUMENTAÇÃO
        </Button>
      </div>
    );
  }

  if (pendingSignature) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex gap-3">
          <PenLine className="shrink-0" />
          <p className="font-medium mt-0.5">
            Contrato #{contract.id} criado. A assinatura digital promove a proposta para <strong>READY_FOR_NEXT_STAGE</strong> — não altere o status manualmente.
          </p>
        </div>
        <div className="flex flex-col items-center py-10 bg-gray-50 rounded-3xl border border-gray-100 gap-4">
          <ScrollText className="w-12 h-12 text-climbe-primary" />
          <h3 className="text-xl font-black italic text-climbe-secondary">Aguardando Assinatura</h3>
          <p className="text-sm text-gray-500 max-w-md text-center">
            Assine o contrato na página de Contratos. Após a assinatura, o fluxo avançará automaticamente.
          </p>
          <Link to={`/contratos?proposalId=${proposal.id}`}>
            <Button className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl gap-2">
              <ExternalLink size={16} /> Ir para Contratos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <ScrollText className="shrink-0" />
        <p className="font-medium mt-0.5">
          Proposta aprovada! O Compliance deve gerar o contrato. O analista responsável pode ser atribuído nesta etapa ou depois.
        </p>
      </div>

      {!contratoCriado && mayCreateContract ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Data de Início do Contrato
              </Label>
              <Tooltip content={!canCreate ? 'Apenas Compliance pode criar contratos.' : ''}>
                <Input
                  type="date"
                  required
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  disabled={!canCreate || contratoMutation.isPending}
                />
              </Tooltip>
            </div>

            {mayAssignAnalyst && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Analista Responsável
                </Label>
                <Tooltip content={(!canAssignAnalystRole && !canCreate) ? 'Sem permissão para atribuir analistas.' : ''}>
                  <select
                    value={analistaId}
                    onChange={e => setAnalistaId(e.target.value)}
                    disabled={(!canAssignAnalystRole && !canCreate) || contratoMutation.isPending}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione um analista (opcional)...</option>
                    {analysts.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role || 'Analista'})
                      </option>
                    ))}
                  </select>
                </Tooltip>
              </div>
            )}
          </div>

          {selectedAnalyst && (
            <div className="flex items-center gap-4 p-4 bg-climbe-primary/5 rounded-2xl border border-climbe-primary/20">
              <div className="w-12 h-12 rounded-full bg-climbe-primary flex items-center justify-center text-climbe-secondary font-black text-lg">
                {(selectedAnalyst.fullName || selectedAnalyst.email || 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-climbe-secondary">{selectedAnalyst.fullName || selectedAnalyst.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {selectedAnalyst.role} · Será notificado por e-mail
                </p>
              </div>
              <Mail size={16} className="text-climbe-primary ml-auto" />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Tooltip content={!canCreate ? 'Apenas Compliance pode criar contratos.' : ''}>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={!canCreate || !dataInicio || contratoMutation.isPending}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                GERAR CONTRATO
              </Button>
            </Tooltip>
          </div>
        </div>
      ) : !mayCreateContract ? (
        <p className="text-sm text-gray-500">
          A proposta precisa estar em <strong>COMMERCIAL_PROPOSAL_APPROVED</strong> para criar o contrato.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-2xl font-black italic text-green-700">Contrato Criado</h3>
            <p className="text-green-600/80 mt-2 max-w-md mx-auto text-sm">
              Assine o contrato em Contratos para avançar o fluxo.
            </p>
          </div>
          <div className="flex justify-end">
            <Link to={`/contratos?proposalId=${proposal.id}`}>
              <Button className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl gap-2">
                <PenLine size={16} /> Assinar em Contratos
              </Button>
            </Link>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setError(''); contratoMutation.mutate(); }}
        title={`Confirmar criação de contrato para ${empresa.tradeName || empresa.legalName}?`}
        description="Após a criação, o contrato deverá ser assinado digitalmente para avançar a proposta."
        confirmLabel="Sim, gerar contrato"
        cancelLabel="Cancelar"
        variant="warning"
        isLoading={contratoMutation.isPending}
      >
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Empresa:</span>
            <span className="font-bold text-climbe-secondary">{empresa.tradeName || empresa.legalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Data de início:</span>
            <span className="font-bold text-climbe-secondary">
              {dataInicio ? new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
          {selectedAnalyst && (
            <div className="flex justify-between">
              <span className="text-gray-400">Analista:</span>
              <span className="font-bold text-climbe-secondary">{selectedAnalyst.fullName || selectedAnalyst.email}</span>
            </div>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
