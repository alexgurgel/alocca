import { cn } from "@/lib/utils";
import { TONE_CLASSES } from "@/lib/constants";

interface StatusBadgeProps {
  label: string;
  tone: keyof typeof TONE_CLASSES;
  className?: string;
}

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
