"use client";

import { AlertTriangle, Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVALIACAO_LABEL, type AvaliacaoFreelancer } from "@/types";

const OPCOES: { valor: AvaliacaoFreelancer; icon: typeof Star; activeClass: string }[] = [
  {
    valor: "recomendo",
    icon: Star,
    activeClass: "bg-[var(--success)] text-white border-[var(--success)]",
  },
  {
    valor: "ok",
    icon: ThumbsUp,
    activeClass: "bg-[var(--warning)] text-white border-[var(--warning)]",
  },
  {
    valor: "nao_recomendo",
    icon: AlertTriangle,
    activeClass: "bg-destructive text-white border-destructive",
  },
];

export function AvaliacaoButtons({
  avaliacao,
  onChange,
}: {
  avaliacao: AvaliacaoFreelancer | null;
  onChange: (avaliacao: AvaliacaoFreelancer | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {OPCOES.map((opcao) => {
        const ativo = avaliacao === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            title={AVALIACAO_LABEL[opcao.valor]}
            onClick={() => onChange(ativo ? null : opcao.valor)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              ativo ? opcao.activeClass : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <opcao.icon className="size-3.5" />
            <span className="hidden sm:inline">{AVALIACAO_LABEL[opcao.valor]}</span>
          </button>
        );
      })}
    </div>
  );
}
