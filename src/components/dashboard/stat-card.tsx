import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "blue" | "purple" | "cyan";
  loading?: boolean;
  href?: string;
}

const TONE_STYLES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300",
};

export function StatCard({ label, value, icon: Icon, tone = "blue", loading, href }: StatCardProps) {
  const conteudo = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn("flex size-9 items-center justify-center rounded-xl", TONE_STYLES[tone])}>
          <Icon className="size-[18px]" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      )}
    </>
  );

  const className = cn(
    "rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
    href && "block cursor-pointer hover:border-primary/40"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {conteudo}
      </Link>
    );
  }

  return <div className={className}>{conteudo}</div>;
}
