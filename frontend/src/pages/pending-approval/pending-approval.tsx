import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ASSETS } from '@/config/assets';

export function PendingApprovalPage() {
  const { logout, user } = useAuthContext();
  const LOGO_PRETA = ASSETS.logos.dark;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8 fade-in">
        <div className="flex justify-center">
          <img
            src={LOGO_PRETA}
            alt="Climbe"
            className="h-16 object-contain"
          />
        </div>

        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-black text-climbe-secondary tracking-tighter">
            Conta em Análise
          </h1>
          
          <p className="text-gray-500 font-light">
            Olá <span className="font-bold text-climbe-secondary">{user?.fullName || user?.name}</span>, sua solicitação de acesso foi enviada para nossos administradores.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-2xl text-left border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Próximos passos</p>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-climbe-primary shrink-0" />
                <span>Nossa equipe revisará seu perfil e permissões.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-climbe-primary shrink-0" />
                <span>Você receberá um e-mail assim que sua conta for aprovada.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full h-12 border-gray-200"
            onClick={() => logout()}
          >
            VOLTAR PARA O LOGIN
          </Button>
        </div>
        
        <p className="text-[10px] text-gray-300 uppercase font-black tracking-[0.3em]">
          Climbe Investimentos
        </p>
      </div>
    </div>
  );
}
