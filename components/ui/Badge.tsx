import { cn } from '@/lib/utils/cn'
import type { Rank } from '@/types'

const rankStyles: Record<Rank, string> = {
  Mythic:    'border-red-500/50 bg-red-500/10 text-red-300',
  Legendary: 'border-gold text-gold',
  Epic:      'border-violet-500/50 bg-violet-500/10 text-violet-300',
  Rare:      'border-rune text-rune',
  Uncommon:  'border-fire text-fire',
  Common:    'border-mist text-mist',
}

interface BadgeProps {
  rank:       Rank
  className?: string
}

export function Badge({ rank, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'border font-cinzel text-[0.5rem] tracking-[0.15em] uppercase px-2 py-0.5',
        rankStyles[rank],
        className,
      )}
    >
      {rank}
    </span>
  )
}
