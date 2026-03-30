import { cn } from "../../lib/utils"

export function Badge({ className, variant = 'default', children, ...props }: {
  className?: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline'; children: React.ReactNode
} & React.HTMLAttributes<HTMLSpanElement>) {
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input text-foreground',
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
