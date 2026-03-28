import { cn } from '@/lib/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, id, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-mist"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'border border-rune/20 bg-stone px-4 py-3 font-mono text-sm text-parchment outline-none',
          'placeholder:text-mist/40 focus:border-rune-dim transition-colors',
          className,
        )}
        {...props}
      />
    </div>
  )
}
