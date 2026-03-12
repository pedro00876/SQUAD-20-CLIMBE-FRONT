import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '@/contexts/AuthContext';
import { loginSchema, LoginFormData } from '../schemas/login.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function LoginForm() {
  const { login } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Falha no login:', error);
      // Tratamento de erro poderia exibir um toast ou erro visual aqui
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-climbe-primary"></div>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 w-16 h-16 bg-climbe-support/10 rounded-full flex items-center justify-center">
          <img src="/assets/images/logos/climbe.svg" alt="Climbe Logo" className="w-10 h-10 object-contain" onError={(e) => {
             // Fallback case the logo doesn't exist yet
             (e.currentTarget as HTMLImageElement).src = '';
             (e.currentTarget as HTMLImageElement).className = 'hidden';
          }} />
        </div>
        <CardTitle className="text-2xl font-bold font-sans text-climbe-secondary">Acesso ao Sistema</CardTitle>
        <CardDescription>
          Insira suas credenciais corporativas
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? 'text-red-500' : 'text-climbe-secondary'}>E-mail Institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@climbe.com.br"
              className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className={errors.password ? 'text-red-500' : 'text-climbe-secondary'}>Senha</Label>
              <a href="#" className="text-sm text-climbe-primary hover:underline" onClick={(e) => e.preventDefault()}>
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-8 pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Autenticando...' : 'Entrar'}
          </Button>

          {/* <div className="relative w-full text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={() => {}} disabled={isSubmitting}>
            Continuar com Google
          </Button> */}
        </CardFooter>
      </form>
    </Card>
  );
}
