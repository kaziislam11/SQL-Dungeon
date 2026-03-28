import { cn } from '@/lib/utils/cn'

interface StarRatingProps {
  value:      number   // 1–5
  max?:       number
  className?: string
}

export function StarRating({ value, max = 5, className }: StarRatingProps) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`text-xs ${i < value ? 'text-gold' : 'text-gold/20'}`}>★</span>
      ))}
    </div>
  )
}
