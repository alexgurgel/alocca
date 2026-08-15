"use client";

import { Copy, IdCard, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatCPF, formatTelefone } from "@/lib/format";
import type { Funcionario } from "@/types";

interface FreelancerInfoPopoverProps {
  funcionario: Pick<Funcionario, "nome" | "telefone" | "email" | "cpf">;
  children: React.ReactNode;
}

async function copiar(valor: string, rotulo: string) {
  await navigator.clipboard.writeText(valor);
  toast.success(`${rotulo} copiado.`);
}

export function FreelancerInfoPopover({ funcionario, children }: FreelancerInfoPopoverProps) {
  const campos = [
    { icon: Phone, rotulo: "Telefone", valor: formatTelefone(funcionario.telefone) },
    { icon: Mail, rotulo: "E-mail", valor: funcionario.email ?? "" },
    { icon: IdCard, rotulo: "CPF", valor: formatCPF(funcionario.cpf) },
  ].filter((campo) => campo.valor);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="truncate text-left text-sm font-medium text-foreground hover:underline"
          />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <p className="mb-2 text-sm font-semibold text-foreground">{funcionario.nome}</p>
        {campos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum dado de contato cadastrado.</p>
        ) : (
          <ul className="space-y-1.5">
            {campos.map((campo) => (
              <li
                key={campo.rotulo}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5"
              >
                <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                  <campo.icon className="size-3.5 shrink-0" />
                  <span className="truncate text-foreground">{campo.valor}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => copiar(campo.valor, campo.rotulo)}
                >
                  <Copy className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
