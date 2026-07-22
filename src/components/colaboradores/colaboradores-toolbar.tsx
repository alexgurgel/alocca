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
import type { Funcao, StatusFuncionario } from "@/types";
import { STATUS_FUNCIONARIO_LABEL } from "@/types";

interface ColaboradoresToolbarProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  status: StatusFuncionario | "todos";
  onStatusChange: (value: StatusFuncionario | "todos") => void;
  funcaoId: string;
  onFuncaoChange: (value: string) => void;
  funcoes: Funcao[];
}

export function ColaboradoresToolbar({
  busca,
  onBuscaChange,
  status,
  onStatusChange,
  funcaoId,
  onFuncaoChange,
  funcoes,
}: ColaboradoresToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF..."
          className="pl-8"
        />
      </div>

      <Select
        items={{ todos: "Todos os status", ativo: STATUS_FUNCIONARIO_LABEL.ativo, inativo: STATUS_FUNCIONARIO_LABEL.inativo }}
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusFuncionario | "todos")}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="ativo">{STATUS_FUNCIONARIO_LABEL.ativo}</SelectItem>
          <SelectItem value="inativo">{STATUS_FUNCIONARIO_LABEL.inativo}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        items={{ todas: "Todas as funções", ...Object.fromEntries(funcoes.map((f) => [f.id, f.nome])) }}
        value={funcaoId}
        onValueChange={(value) => onFuncaoChange(value as string)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Função" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as funções</SelectItem>
          {funcoes.map((funcao) => (
            <SelectItem key={funcao.id} value={funcao.id}>
              {funcao.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
