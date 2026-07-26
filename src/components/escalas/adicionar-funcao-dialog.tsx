"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { escalaFuncaoSchema, type EscalaFuncaoInput } from "@/lib/validations/escala.schema";
import type { Funcao } from "@/types";

interface AdicionarFuncaoDialogProps {
  funcoes: Funcao[];
  funcoesJaAdicionadas: string[];
  onAdicionar: (input: EscalaFuncaoInput) => Promise<void>;
}

export function AdicionarFuncaoDialog({
  funcoes,
  funcoesJaAdicionadas,
  onAdicionar,
}: AdicionarFuncaoDialogProps) {
  const [open, setOpen] = useState(false);
  const disponiveis = funcoes.filter((f) => !funcoesJaAdicionadas.includes(f.id));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EscalaFuncaoInput>({
    resolver: zodResolver(escalaFuncaoSchema),
    defaultValues: { funcao_id: "", vagas: 1, valor_diaria: "" },
  });

  async function onSubmit(values: EscalaFuncaoInput) {
    await onAdicionar(values);
    reset({ funcao_id: "", vagas: 1, valor_diaria: "" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" disabled={disponiveis.length === 0} />}>
        <Plus />
        Adicionar função
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar função à escala</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.funcao_id}>
            <FieldLabel htmlFor="funcao_id">Função</FieldLabel>
            <Controller
              control={control}
              name="funcao_id"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries(disponiveis.map((f) => [f.id, f.nome]))}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="funcao_id" className="w-full">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {disponiveis.map((funcao) => (
                      <SelectItem key={funcao.id} value={funcao.id}>
                        {funcao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.funcao_id]} />
          </Field>

          <Field data-invalid={!!errors.vagas}>
            <FieldLabel htmlFor="vagas">Quantidade de vagas</FieldLabel>
            <Input id="vagas" type="number" min={1} {...register("vagas", { valueAsNumber: true })} />
            <FieldError errors={[errors.vagas]} />
          </Field>

          <Field data-invalid={!!errors.valor_diaria}>
            <FieldLabel htmlFor="valor_diaria">Valor da diária (R$)</FieldLabel>
            <Input
              id="valor_diaria"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 120,00"
              {...register("valor_diaria")}
            />
            <FieldError errors={[errors.valor_diaria]} />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || disponiveis.length === 0}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
