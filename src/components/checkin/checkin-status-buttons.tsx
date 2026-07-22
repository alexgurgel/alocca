"use client";

import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusCheckin } from "@/types";

const OPCOES: { status: StatusCheckin; label: string; icon: typeof Check; activeClass: string }[] = [
  {
    status: "presente",
    label: "Presente",
    icon: Check,
    activeClass: "bg-[var(--success)] text-white border-[var(--success)]",
  },
  {
    status: "atrasado",
    label: "Atrasado",
    icon: Clock,
    activeClass: "bg-[var(--warning)] text-white border-[var(--warning)]",
  },
  {
    status: "ausente",
    label: "Ausente",
    icon: X,
    activeClass: "bg-destructive text-white border-destructive",
  },
];

export function CheckinStatusButtons({
  status,
  onChange,
}: {
  status: StatusCheckin;
  onChange: (status: StatusCheckin) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {OPCOES.map((opcao) => {
        const ativo = status === opcao.status;
        return (
          <button
            key={opcao.status}
            type="button"
            onClick={() => onChange(ativo ? "pendente" : opcao.status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              ativo ? opcao.activeClass : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <opcao.icon className="size-3.5" />
            {opcao.label}
          </button>
        );
      })}
    </div>
  );
}
