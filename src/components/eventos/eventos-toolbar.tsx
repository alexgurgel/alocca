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
import type { StatusEvento } from "@/types";
import { STATUS_EVENTO_LABEL } from "@/types";

interface EventosToolbarProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  status: StatusEvento | "todos";
  onStatusChange: (value: StatusEvento | "todos") => void;
}

export function EventosToolbar({ busca, onBuscaChange, status, onStatusChange }: EventosToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar por nome, cliente ou local..."
          className="pl-8"
        />
      </div>

      <Select
        items={{
          todos: "Todos os status",
          planejado: STATUS_EVENTO_LABEL.planejado,
          em_andamento: STATUS_EVENTO_LABEL.em_andamento,
          finalizado: STATUS_EVENTO_LABEL.finalizado,
          cancelado: STATUS_EVENTO_LABEL.cancelado,
        }}
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusEvento | "todos")}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="planejado">{STATUS_EVENTO_LABEL.planejado}</SelectItem>
          <SelectItem value="em_andamento">{STATUS_EVENTO_LABEL.em_andamento}</SelectItem>
          <SelectItem value="finalizado">{STATUS_EVENTO_LABEL.finalizado}</SelectItem>
          <SelectItem value="cancelado">{STATUS_EVENTO_LABEL.cancelado}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
