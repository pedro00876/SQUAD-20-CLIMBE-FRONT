import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all',
        'text-muted-foreground hover:bg-muted hover:text-climbe-primary',
        className,
      )}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <Sun
        size={18}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
      <Moon
        size={18}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  );
}
