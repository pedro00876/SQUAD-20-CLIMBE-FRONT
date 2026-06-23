import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cargoService } from '@/features/usuarios/services';
import type { Cargo, CreateUserRequest } from '@/features/usuarios/types';
import { maskCPF, maskPhone } from '@/utils/masks';

const userSchema = z.object({
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(14, 'CPF inválido'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Selecione um cargo'),
  status: z.string().default('ATIVO'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest) => void;
  isSubmitting: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: UserModalProps) {
  const [roles, setRoles] = useState<Cargo[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cpf: '',
      phone: '',
      role: '',
      status: 'ATIVO',
    },
  });

  const cpfValue = watch('cpf');
  const phoneValue = watch('phone');

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    } else {
      reset();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await cargoService.listCargos(0, 100);
      setRoles(response.content || []);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data as CreateUserRequest);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] max-w-lg overflow-y-auto bg-climbe-secondary text-white p-0"
    >
      <div className="relative p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 text-climbe-primary mb-2">
            <UserPlus size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Novo Cadastro</span>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">Criar Usuário</h2>
          <p className="text-sm text-slate-400 font-light mt-1">
            Preencha as informações básicas para registrar um novo colaborador no sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 ml-1">Nome Completo</Label>
              <Input
                {...register('fullName')}
                placeholder="Ex: João Silva"
                className="bg-white text-slate-900 border-transparent focus:ring-climbe-primary/20 rounded-xl py-6"
              />
              {errors.fullName && <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 ml-1">E-mail Corporativo</Label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="joao@empresa.com"
                  className="bg-white text-slate-900 border-transparent focus:ring-climbe-primary/20 rounded-xl py-6"
                />
                {errors.email && <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 ml-1">CPF</Label>
                <Input
                  {...register('cpf')}
                  value={cpfValue}
                  onChange={(e) => setValue('cpf', maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="bg-white text-slate-900 border-transparent focus:ring-climbe-primary/20 rounded-xl py-6"
                />
                {errors.cpf && <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{errors.cpf.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 ml-1">Telefone</Label>
                <Input
                  {...register('phone')}
                  value={phoneValue}
                  onChange={(e) => setValue('phone', maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="bg-white text-slate-900 border-transparent focus:ring-climbe-primary/20 rounded-xl py-6"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 ml-1">Cargo / Role</Label>
                <select
                  {...register('role')}
                  className="w-full bg-white text-slate-900 border-transparent focus:ring-climbe-primary/20 rounded-xl h-[52px] px-3 font-medium text-sm outline-none transition-all focus:ring-2"
                >
                  <option value="">Selecione um cargo...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                  {!isLoadingRoles && roles.length === 0 && (
                    <option value="USER">Padrão (USER)</option>
                  )}
                </select>
                {errors.role && <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{errors.role.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary rounded-xl h-12"
            >
              CANCELAR
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 font-black italic text-climbe-secondary bg-climbe-primary hover:bg-climbe-primary/90 shadow-lg shadow-climbe-primary/20 rounded-xl h-12"
            >
              {isSubmitting ? 'CRIANDO...' : 'CRIAR USUÁRIO'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
