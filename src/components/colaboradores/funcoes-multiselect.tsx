"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Funcao } from "@/types";

interface FuncoesMultiselectProps {
  funcoes: Funcao[];
  selecionadas: string[];
  onChange: (ids: string[]) => void;
}

export function FuncoesMultiselect({ funcoes, selecionadas, onChange }: FuncoesMultiselectProps) {
  const [open, setOpen] = useState(false);

  function alternar(id: string) {
    onChange(
      selecionadas.includes(id)
        ? selecionadas.filter((item) => item !== id)
        : [...selecionadas, id]
    );
  }

  const selecionadasNomes = funcoes.filter((f) => selecionadas.includes(f.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className="flex flex-wrap items-center gap-1 text-left">
          {selecionadasNomes.length === 0 ? (
            <span className="text-muted-foreground">Selecione uma ou mais funções</span>
          ) : (
            selecionadasNomes.map((f) => (
              <Badge key={f.id} variant="secondary" className="font-normal">
                {f.nome}
              </Badge>
            ))
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar função..." />
          <CommandList>
            <CommandEmpty>Nenhuma função cadastrada.</CommandEmpty>
            <CommandGroup>
              {funcoes.map((funcao) => {
                const marcado = selecionadas.includes(funcao.id);
                return (
                  <CommandItem key={funcao.id} onSelect={() => alternar(funcao.id)}>
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded border border-input",
                        marcado && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {marcado ? <Check className="size-3" /> : null}
                    </div>
                    {funcao.nome}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
