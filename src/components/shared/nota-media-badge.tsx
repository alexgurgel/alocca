import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotaMediaBadge({
  notaMedia,
  totalAvaliacoes,
  className,
}: {
  notaMedia: number | null | undefined;
  totalAvaliacoes?: number;
  className?: string;
}) {
  if (notaMedia == null) return null;

  return (
    <span
      title={totalAvaliacoes ? `Média de ${totalAvaliacoes} avaliação(ões)` : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
        className
      )}
    >
      <Star className="size-3 fill-current" />
      {notaMedia.toFixed(1)}
    </span>
  );
}
