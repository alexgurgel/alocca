"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColaboradorStatusBadge } from "./colaborador-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/format";
import type { FuncionarioComFuncoes } from "@/types";

interface ColaboradoresTableProps {
  dados: FuncionarioComFuncoes[];
  carregando: boolean;
  ordenarPor: "nome" | "created_at" | "status";
  ordemAsc: boolean;
  onOrdenar: (coluna: "nome" | "created_at" | "status") => void;
  onExcluir: (funcionario: FuncionarioComFuncoes) => void;
}

function OrdenarBotao({
  coluna,
  label,
  ordenarPor,
  ordemAsc,
  onOrdenar,
}: {
  coluna: "nome" | "created_at" | "status";
  label: string;
} & Pick<ColaboradoresTableProps, "ordenarPor" | "ordemAsc" | "onOrdenar">) {
  const ativo = ordenarPor === coluna;
  return (
    <button
      onClick={() => onOrdenar(coluna)}
      className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      {ativo ? (
        ordemAsc ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : null}
    </button>
  );
}

export function ColaboradoresTable({
  dados,
  carregando,
  ordenarPor,
  ordemAsc,
  onOrdenar,
  onExcluir,
}: ColaboradoresTableProps) {
  if (carregando) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nenhum colaborador encontrado"
        description="Ajuste os filtros ou cadastre um novo colaborador para começar."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <OrdenarBotao
                coluna="nome"
                label="Nome"
                ordenarPor={ordenarPor}
                ordemAsc={ordemAsc}
                onOrdenar={onOrdenar}
              />
            </TableHead>
            <TableHead>Funções</TableHead>
            <TableHead className="hidden md:table-cell">Cidade/UF</TableHead>
            <TableHead className="hidden lg:table-cell">Contato</TableHead>
            <TableHead>
              <OrdenarBotao
                coluna="status"
                label="Status"
                ordenarPor={ordenarPor}
                ordemAsc={ordemAsc}
                onOrdenar={onOrdenar}
              />
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.map((funcionario) => (
            <TableRow key={funcionario.id}>
              <TableCell>
                <Link
                  href={`/colaboradores/${funcionario.id}`}
                  className="flex items-center gap-3"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={funcionario.foto_url ?? undefined} alt={funcionario.nome} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(funcionario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {funcionario.nome}
                    </p>
                    {funcionario.cpf ? (
                      <p className="truncate text-xs text-muted-foreground">{funcionario.cpf}</p>
                    ) : null}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex max-w-56 flex-wrap gap-1">
                  {funcionario.funcoes.length === 0 ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    funcionario.funcoes.map((funcao) => (
                      <Badge key={funcao.id} variant="secondary" className="font-normal">
                        {funcao.nome}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {funcionario.cidade ? `${funcionario.cidade}${funcionario.estado ? `/${funcionario.estado}` : ""}` : "—"}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {funcionario.telefone || funcionario.email || "—"}
              </TableCell>
              <TableCell>
                <ColaboradorStatusBadge status={funcionario.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" className="size-8" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href={`/colaboradores/${funcionario.id}`} />}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onExcluir(funcionario)}
                    >
                      <Trash2 />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
