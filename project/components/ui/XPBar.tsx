import { cn } from '@/lib/utils/cn'

interface XPBarProps {
  xp:         number
  rank:       string
  xpInfo:     { next: string; needed: number; pct: number }
  className?: string
}

export function XPBar({ xp, rank, xpInfo, className }: XPBarProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-mist">Experience</span>
        <span className="font-cinzel text-sm font-bold text-gold">{xp} XP</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-rune/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rune-dim to-rune transition-all duration-700"
          style={{ width: `${xpInfo.pct}%` }}
        />
      </div>
      <div className="font-cinzel text-[0.6rem] tracking-wide text-gold-dim">
        Rank: {rank}
      </div>
      {xpInfo.next !== 'MAX' && (
        <div className="font-cinzel text-[0.55rem] text-mist">
          {xpInfo.needed} XP to {xpInfo.next}
        </div>
      )}
    </div>
  )
}
