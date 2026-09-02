"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusConvite } from "@/types";

export type EscalaFiltroStatus = StatusConvite | "todos";
export type EscalaOrdenacao = "nome" | "status" | "valor_diaria";

const STATUS_LABEL: Record<EscalaFiltroStatus, string> = {
  todos: "Todos os status",
  pendente: "Pendente",
  aceito: "Aceito",
  recusado: "Recusado",
};

const ORDENACAO_LABEL: Record<EscalaOrdenacao, string> = {
  nome: "Nome (A-Z)",
  status: "Status",
  valor_diaria: "Valor da diária",
};

interface EscalaToolbarProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  status: EscalaFiltroStatus;
  onStatusChange: (value: EscalaFiltroStatus) => void;
  ordenarPor: EscalaOrdenacao;
  onOrdenarPorChange: (value: EscalaOrdenacao) => void;
}

export function EscalaToolbar({
  busca,
  onBuscaChange,
  status,
  onStatusChange,
  ordenarPor,
  onOrdenarPorChange,
}: EscalaToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar freelancer..."
          className="pl-8"
        />
      </div>

      <Select
        items={STATUS_LABEL}
        value={status}
        onValueChange={(value) => onStatusChange(value as EscalaFiltroStatus)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABEL) as EscalaFiltroStatus[]).map((valor) => (
            <SelectItem key={valor} value={valor}>
              {STATUS_LABEL[valor]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={ORDENACAO_LABEL}
        value={ordenarPor}
        onValueChange={(value) => onOrdenarPorChange(value as EscalaOrdenacao)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ORDENACAO_LABEL) as EscalaOrdenacao[]).map((valor) => (
            <SelectItem key={valor} value={valor}>
              {ORDENACAO_LABEL[valor]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
