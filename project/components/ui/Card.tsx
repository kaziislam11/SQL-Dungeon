import { cn } from '@/lib/utils/cn'

type Variant = 'default' | 'quest' | 'active'

interface CardProps {
  children:   React.ReactNode
  variant?:   Variant
  className?: string
}

const variantClasses: Record<Variant, string> = {
  default: 'border-rune/15',
  quest:   'border-rune/20 hover:-translate-y-1 transition-transform cursor-pointer',
  active:  'border-rune-dim bg-rune/5',
}

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <div className={cn('border bg-stone p-6', variantClasses[variant], className)}>
      {children}
    </div>
  )
}
