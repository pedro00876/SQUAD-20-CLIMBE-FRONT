import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProcessStepper, ProcessStage } from '@/components/ui/ProcessStepper';
import { useAuthContext } from '@/contexts/AuthContext';
import { hasAnyLogicalRole } from '@/config/roles';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { enterpriseService } from '@/services/enterprise.service';

import { StageCadastro } from '@/features/pipeline/components/StageCadastro';
import { StageReuniao } from '@/features/pipeline/components/StageReuniao';
import { StageProposta } from '@/features/pipeline/components/StageProposta';
import { StageContrato } from '@/features/pipeline/components/StageContrato';
import { StageDocumentacao } from '@/features/pipeline/components/StageDocumentacao';
import { StageFerramentas } from '@/features/pipeline/components/StageFerramentas';
import { StageRelatorio } from '@/features/pipeline/components/StageRelatorio';
import { StageAgendamento } from '@/features/pipeline/components/StageAgendamento';

// Este componente vai orquestrar todas as abas/etapas.
export function EmpresaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [empresa, setEmpresa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<ProcessStage>('CADASTRO');
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (id) {
      enterpriseService.list(0, 100).then((res) => {
        const found = res.content.find((e: any) => e.id === Number(id));
        if (found) {
          setEmpresa(found);
          // TODO: Mapear status real da API para ProcessStage
          setCurrentStage('CADASTRO'); // Começa do inicio para testar
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [id]);

  const canEditAnalista = hasAnyLogicalRole(user?.role, ['ADMIN', 'ANALISTA', 'SENIOR']);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-black italic text-climbe-secondary">Empresa não encontrada</h2>
        <button onClick={() => navigate('/empresas')} className="text-climbe-primary hover:underline font-bold">Voltar para listagem</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/empresas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-climbe-secondary" />
        </button>
        <div>
          <div className="flex items-center gap-3 text-climbe-primary">
            <Building2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Detalhes da Homologação</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-climbe-secondary mt-1">
            {empresa.nomeFantasia || empresa.razaoSocial || empresa.tradeName || empresa.legalName}
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-1">CNPJ: {empresa.cnpj}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 pb-16">
        <h3 className="text-lg font-black italic text-climbe-secondary mb-6">Progresso do Fluxo</h3>
        <ProcessStepper currentStage={currentStage} rejected={rejected} />
      </div>

      {/* Dynamic Content based on stage */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-2xl font-black italic text-climbe-secondary">
            {currentStage === 'CADASTRO' && 'Dados da Empresa'}
            {currentStage === 'REUNIAO' && 'Registro de Reunião'}
            {currentStage === 'PROPOSTA' && 'Proposta Comercial'}
            {currentStage === 'CONTRATO' && 'Gestão do Contrato'}
            {currentStage === 'DOCUMENTACAO' && 'Solicitação de Documentação'}
            {currentStage === 'VALIDACAO' && 'Validação de Documentos'}
            {currentStage === 'FERRAMENTAS' && 'Liberação de Ferramentas'}
            {currentStage === 'RELATORIO' && 'Relatório de Homologação'}
            {currentStage === 'APROVACAO_FINAL' && 'Agendamento / Encerramento'}
            {currentStage === 'CONCLUIDO' && 'Homologação Concluída'}
          </h2>
        </div>
        
        <div className="min-h-[300px]">
          {currentStage === 'CADASTRO' && (
            <StageCadastro 
              empresa={empresa} 
              canAvancar={canEditAnalista} 
              onAvancar={() => setCurrentStage('REUNIAO')} 
            />
          )}
          
          {currentStage === 'REUNIAO' && (
            <StageReuniao 
              empresa={empresa} 
              canEdit={canEditAnalista} 
              onConcluir={(data) => {
                console.log('Reuniao concluida', data);
                setCurrentStage('PROPOSTA');
              }} 
            />
          )}

          {currentStage === 'PROPOSTA' && (
            <StageProposta 
              empresa={empresa} 
              canUpload={canEditAnalista}
              canApprove={hasAnyLogicalRole(user?.role, ['ADMIN', 'APROVADOR', 'SENIOR'])}
              onUpload={(file) => console.log('Proposta enviada', file)}
              onApprove={() => setCurrentStage('CONTRATO')}
              onReject={(reason) => {
                console.log('Proposta reprovada', reason);
                setRejected(true);
              }}
            />
          )}

          {currentStage === 'CONTRATO' && (
            <StageContrato 
              empresa={empresa}
              canCreate={hasAnyLogicalRole(user?.role, ['ADMIN', 'COMPLIANCE'])}
              canAssignAnalyst={hasAnyLogicalRole(user?.role, ['ADMIN', 'APROVADOR', 'SENIOR'])}
              users={[]}
              onConcluir={(data) => {
                console.log('Contrato finalizado', data);
                setCurrentStage('DOCUMENTACAO');
              }}
            />
          )}

          {(currentStage === 'DOCUMENTACAO' || currentStage === 'VALIDACAO') && (
            <StageDocumentacao 
              empresa={empresa}
              userRole={user?.role || ''}
              currentStage={currentStage}
              onConcluir={() => {
                if (currentStage === 'DOCUMENTACAO') {
                  setCurrentStage('VALIDACAO');
                } else {
                  setCurrentStage('FERRAMENTAS');
                }
              }}
            />
          )}

          {currentStage === 'FERRAMENTAS' && (
            <StageFerramentas 
              empresa={empresa}
              canEdit={canEditAnalista}
              onConcluir={(data) => {
                console.log('Ferramentas configuradas', data);
                setCurrentStage('RELATORIO');
              }}
            />
          )}

          {currentStage === 'RELATORIO' && (
            <StageRelatorio 
              empresa={empresa}
              userRole={user?.role || ''}
              onConcluir={(data) => {
                console.log('Relatorio aprovado', data);
                setCurrentStage('APROVACAO_FINAL');
              }}
            />
          )}

          {currentStage === 'APROVACAO_FINAL' && (
            <StageAgendamento 
              empresa={empresa}
              canEdit={hasAnyLogicalRole(user?.role, ['ADMIN', 'SENIOR'])}
              onConcluir={(data) => {
                console.log('Homologacao finalizada', data);
                setCurrentStage('CONCLUIDO');
              }}
            />
          )}

          {currentStage === 'CONCLUIDO' && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Building2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-black italic text-green-700">Homologação Concluída com Sucesso</h3>
              <p className="text-green-600/80 mt-2 max-w-md mx-auto">
                A empresa {empresa.tradeName || empresa.nomeFantasia} agora está 100% homologada e ativa na nossa base de fornecedores parceiros.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

