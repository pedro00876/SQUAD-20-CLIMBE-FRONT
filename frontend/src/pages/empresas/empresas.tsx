import { Building2, Plus, Mail, Phone, User, MapPin, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enterpriseService, type CreateEnterpriseRequest } from '@/services/enterprise.service';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EmpresasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateEnterpriseRequest>({
    legalName: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
    representativeName: '',
    representativeCpf: '',
    representativePhone: '',
    address: {
      city: '',
      state: '',
    }
  });

  const { data: enterprisesPage, isLoading } = useQuery({
    queryKey: ['enterprises'],
    queryFn: () => enterpriseService.list(0, 100)
  });

  const createMutation = useMutation({
    mutationFn: enterpriseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
      setIsModalOpen(false);
      setFormData({
        legalName: '',
        tradeName: '',
        cnpj: '',
        email: '',
        phone: '',
        representativeName: '',
        representativeCpf: '',
        representativePhone: '',
        address: { city: '', state: '' }
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Building2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gerenciamento</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Empresas</h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Visualize e gerencie todas as empresas parceiras e clientes cadastrados no sistema.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-climbe-primary text-climbe-secondary font-black italic rounded-2xl px-6 py-6 shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all shrink-0"
        >
          <Plus size={20} className="mr-2" />
          CADASTRAR EMPRESA
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-climbe-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(enterprisesPage?.content || []).map((enterprise: any) => (
            <div key={enterprise.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-climbe-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               
               <div className="flex items-center gap-4 mb-8 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-climbe-secondary flex items-center justify-center text-white font-black italic text-xl shadow-lg">
                   {enterprise.tradeName?.charAt(0) || enterprise.legalName.charAt(0)}
                 </div>
                 <div>
                   <h4 className="font-bold text-climbe-secondary italic text-lg leading-tight truncate max-w-[180px]">
                     {enterprise.tradeName || enterprise.legalName}
                   </h4>
                   <p className="text-[10px] font-black text-climbe-primary uppercase tracking-widest mt-1">CNPJ: {enterprise.cnpj}</p>
                 </div>
               </div>

               <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3 text-gray-400">
                    <Mail size={14} className="text-climbe-primary" />
                    <span className="text-xs font-medium truncate">{enterprise.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-400">
                    <User size={14} className="text-climbe-primary" />
                    <span className="text-xs font-medium">{enterprise.representativeName || 'N/A'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-400">
                    <MapPin size={14} className="text-climbe-primary" />
                    <span className="text-xs font-medium">{enterprise.address?.city || 'Local não informado'} - {enterprise.address?.state || '--'}</span>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Contratos</span>
                    <span className="font-bold text-climbe-secondary">0 Ativos</span>
                 </div>
                 <button className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline">Ver Detalhes</button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
          <div>
            <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">Nova Empresa</h2>
            <p className="text-xs text-gray-400">Preencha os dados básicos da empresa cliente.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Razão Social</Label>
                <Input 
                  required
                  value={formData.legalName}
                  onChange={e => setFormData({...formData, legalName: e.target.value})}
                  placeholder="Nome legal da empresa" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Nome Fantasia</Label>
                <Input 
                  value={formData.tradeName}
                  onChange={e => setFormData({...formData, tradeName: e.target.value})}
                  placeholder="Ex: Climbe" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">CNPJ</Label>
                <Input 
                  required
                  value={formData.cnpj}
                  onChange={e => setFormData({...formData, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">E-mail</Label>
                <Input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="empresa@exemplo.com" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Telefone</Label>
                <Input 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="(00) 0000-0000" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-climbe-primary uppercase tracking-widest mb-4">Representante</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Nome do Representante</Label>
                  <Input 
                    value={formData.representativeName}
                    onChange={e => setFormData({...formData, representativeName: e.target.value})}
                    placeholder="Nome completo" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="flex-1 bg-climbe-secondary text-white font-black italic rounded-xl"
              >
                {createMutation.isPending ? 'SALVANDO...' : 'SALVAR EMPRESA'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
