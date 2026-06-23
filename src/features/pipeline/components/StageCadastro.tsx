import { Building2, Mail, MapPin, Phone, User, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/Tooltip';
import { StageAccessDenied } from '@/components/ui/StageAccessDenied';

interface StageCadastroProps {
  empresa: any;
  onAvancar: () => void;
  canAvancar: boolean;
}

function FieldRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  const present = !!value && value.trim() !== '';
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 w-1/2 min-w-0">
        <Icon size={13} className="text-gray-400 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 w-1/2 min-w-0">
        {present ? (
          <CheckCircle2 size={13} className="text-green-500 shrink-0" />
        ) : (
          <AlertCircle size={13} className="text-amber-400 shrink-0" />
        )}
        <span className={`text-sm font-medium truncate ${present ? 'text-climbe-secondary' : 'text-amber-500 italic'}`}>
          {present ? value : 'Não informado'}
        </span>
      </div>
    </div>
  );
}

export function StageCadastro({ empresa, onAvancar, canAvancar }: StageCadastroProps) {
  const address = empresa.address;
  const addressText = address
    ? `${address.street ?? ''}, ${address.number ?? ''} — ${address.city ?? ''} - ${address.state ?? ''}`.trim()
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados Principais */}
        <div className="space-y-1 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-bold italic text-climbe-secondary flex items-center gap-2 mb-3">
            <Building2 size={16} /> Dados Principais
          </h4>
          <FieldRow icon={Building2} label="Razão Social"  value={empresa.legalName} />
          <FieldRow icon={Building2} label="Nome Fantasia" value={empresa.tradeName} />
          <FieldRow icon={Building2} label="CNPJ"          value={empresa.cnpj} />
        </div>

        {/* Contato e Endereço */}
        <div className="space-y-1 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-bold italic text-climbe-secondary flex items-center gap-2 mb-3">
            <User size={16} /> Contato e Endereço
          </h4>
          <FieldRow icon={Mail}   label="E-mail"         value={empresa.email} />
          <FieldRow icon={Phone}  label="Telefone"       value={empresa.phone} />
          <FieldRow icon={User}   label="Representante"  value={empresa.representativeName} />
          <FieldRow icon={MapPin} label="Endereço"       value={addressText} />
        </div>
      </div>

      {/* Nota informativa — Seguros */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <Shield size={16} className="text-amber-500 mt-0.5 shrink-0" />
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Nota — Seguros da Empresa</span>
          <p className="text-xs text-amber-700 mt-1 font-light leading-relaxed">
            Os <strong className="font-bold">Seguros da Empresa</strong> não são rastreáveis neste sistema. Certifique-se de
            que a documentação comprobatória de seguros seja verificada manualmente e arquivada antes de prosseguir com o
            fluxo de homologação.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        {canAvancar ? (
          <Tooltip
            content="Ao confirmar, você iniciará o registro da reunião inicial com o contratante. Esta ação não pode ser desfeita."
            side="top"
          >
            <Button
              onClick={onAvancar}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl hover:scale-105 transition-all"
            >
              CONFIRMAR DADOS E AVANÇAR
            </Button>
          </Tooltip>
        ) : (
          <StageAccessDenied
            requiredRoles={['CMO', 'CEO']}
            currentStageLabel="Cadastro"
            hint="Entre em contato com um CMO ou CEO para avançar esta etapa."
          />
        )}
      </div>
    </div>
  );
}
