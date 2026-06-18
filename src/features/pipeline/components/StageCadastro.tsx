import { Building2, Mail, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StageCadastroProps {
  empresa: any;
  onAvancar: () => void;
  canAvancar: boolean;
}

export function StageCadastro({ empresa, onAvancar, canAvancar }: StageCadastroProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-bold italic text-climbe-secondary flex items-center gap-2">
            <Building2 size={16} /> Dados Principais
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Razão Social</span>
              <p className="font-medium text-sm text-climbe-secondary">{empresa.legalName}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Fantasia</span>
              <p className="font-medium text-sm text-climbe-secondary">{empresa.tradeName || '-'}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">CNPJ</span>
              <p className="font-medium text-sm text-climbe-secondary">{empresa.cnpj}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-bold italic text-climbe-secondary flex items-center gap-2">
            <User size={16} /> Contato e Endereço
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-climbe-secondary">{empresa.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-climbe-secondary">{empresa.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-climbe-secondary">Representante: {empresa.representativeName || '-'}</span>
            </div>
            <div className="flex items-start gap-2 pt-2">
              <MapPin size={14} className="text-gray-400 mt-1" />
              <span className="text-sm font-medium text-climbe-secondary">
                {empresa.address?.street}, {empresa.address?.number}
                <br />
                {empresa.address?.city} - {empresa.address?.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        {canAvancar && (
          <Button 
            onClick={onAvancar}
            className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl hover:scale-105 transition-all"
          >
            CONFIRMAR DADOS E AVANÇAR
          </Button>
        )}
      </div>
    </div>
  );
}
