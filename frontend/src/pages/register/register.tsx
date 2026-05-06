import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { routes } from '@/config/routes';
import { ASSETS } from '@/config/assets';
import { useRegister } from '@/features/auth/hooks';
import { maskCPF, maskPhone, unmask } from '@/utils/masks';

const LOGO_BRANCA = ASSETS.logos.light;
const LOGO_PRETA = ASSETS.logos.dark;

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(14, 'CPF incompleto'),
  phone: z.string().min(14, 'Telefone incompleto'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: performRegister, isLoading, isError, error } = useRegister();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard);
    }
  }, [isAuthenticated, navigate]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cpf: '',
      phone: '',
      password: '',
    },
  });

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', maskCPF(e.target.value), { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('phone', maskPhone(e.target.value), { shouldValidate: true });
  };

  const onSubmit = (data: RegisterFormData) => {
    performRegister({
      ...data,
      cpf: unmask(data.cpf),
      phone: unmask(data.phone),
      cargoId: 1,
      roleId: 1,
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-white lg:bg-climbe-secondary">
      {/* PAINEL ESQUERDO */}
      <div className="hidden lg:flex flex-grow bg-climbe-secondary relative flex-col p-20 overflow-hidden">
        <div className="fade-down mb-16">
          <img
            src={LOGO_BRANCA}
            alt="Climbe"
            className="h-20 object-contain ml-[-8px]"
          />
          <p className="text-white/40 uppercase tracking-[0.5em] text-[10px] font-bold mt-1 ml-1">
            Gestão inteligente de contratos.
          </p>
        </div>

        <div className="relative z-10 max-w-2xl mt-auto mb-24">
          <h1 className="fade-up text-white text-7xl font-black leading-[1.05] mb-8 tracking-tighter">
            Crie sua conta e<br />
            comece a <span className="text-climbe-primary underline decoration-climbe-primary/30 underline-offset-8">organizar tudo.</span>
          </h1>
        </div>
      </div>

      {/* PAINEL DIREITO */}
      <div className="w-full lg:w-[35%] lg:min-w-[500px] bg-white flex flex-col p-6 sm:p-8 justify-center fade-in shadow-2xl z-20">
        <div className="mb-6">
          <img
            src={LOGO_PRETA}
            alt="Climbe"
            className="h-10 object-contain mb-4"
          />
          <h2 className="text-climbe-secondary text-3xl font-black mb-1 tracking-tighter">Cadastro.</h2>
          <p className="text-gray-400 font-light text-sm">Preencha os dados para solicitar acesso.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">Nome Completo</label>
            <Input
              {...register('fullName')}
              placeholder="Ex: João Silva"
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-red-500 text-xs ml-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">CPF</label>
              <Input
                {...register('cpf')}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                disabled={isLoading}
              />
              {errors.cpf && <p className="text-red-500 text-xs ml-1">{errors.cpf.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">Telefone</label>
              <Input
                {...register('phone')}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                disabled={isLoading}
              />
              {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">E-mail Corporativo</label>
            <Input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">Senha</label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
          </div>

          {isError && (
            <div className="flex items-center gap-2.5 px-1 py-1 animate-in fade-in slide-in-from-top-1">
              <div className="w-1 h-1 rounded-full bg-red-400" />
              <p className="text-red-500 text-[11px] font-semibold uppercase tracking-widest">
                {error && (error as any).response?.data?.message 
                  ? (error as any).response.data.message 
                  : 'Falha ao realizar cadastro. Verifique os dados.'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 shadow-none mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processando...
              </span>
            ) : 'SOLICITAR CADASTRO'}
          </Button>
        </form>

        <div className="mt-4 text-center border-t border-gray-50 pt-4">
          <p className="text-sm text-gray-400 font-light tracking-tight">
            Já tem uma conta? <Link to={routes.login} className="text-climbe-primary font-bold hover:underline underline-offset-4">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
