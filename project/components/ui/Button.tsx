import { cn } from '@/lib/utils/cn'

type Variant = 'rune' | 'gold' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    Size
}

const variantClasses: Record<Variant, string> = {
  rune:  'border border-rune-dim bg-rune/10 text-rune hover:bg-rune/25 hover:border-rune hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  gold:  'border border-gold/25 bg-gold/10 text-gold hover:bg-gold/20 hover:shadow-[0_0_20px_rgba(240,180,41,0.25)]',
  ghost: 'border border-rune/15 text-mist hover:border-rune/30 hover:text-parchment',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[0.6rem]',
  md: 'px-6 py-2.5 text-[0.65rem]',
  lg: 'px-10 py-3.5 text-sm font-bold',
}

export function Button({ variant = 'rune', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-cinzel tracking-[0.2em] uppercase transition-all hover:-translate-y-px',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
