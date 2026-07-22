"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";

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
import { funcaoSchema, type FuncaoInput } from "@/lib/validations/funcao.schema";
import type { Funcao } from "@/types";

interface FuncaoDialogProps {
  funcao?: Funcao;
  onSalvar: (input: FuncaoInput) => Promise<void>;
}

export function FuncaoDialog({ funcao, onSalvar }: FuncaoDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FuncaoInput>({
    resolver: zodResolver(funcaoSchema),
    defaultValues: { nome: funcao?.nome ?? "", descricao: funcao?.descricao ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ nome: funcao?.nome ?? "", descricao: funcao?.descricao ?? "" });
    }
  }, [open, funcao, reset]);

  async function onSubmit(values: FuncaoInput) {
    await onSalvar(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={funcao ? <Button variant="ghost" size="icon-sm" /> : <Button size="sm" />}
      >
        {funcao ? <Pencil className="size-3.5" /> : (
          <>
            <Plus />
            Nova função
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{funcao ? "Editar função" : "Nova função"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.nome}>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" placeholder="Ex: Garçom" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <Field data-invalid={!!errors.descricao}>
            <FieldLabel htmlFor="descricao">Descrição (opcional)</FieldLabel>
            <Input id="descricao" placeholder="Ex: Atendimento em salão" {...register("descricao")} />
            <FieldError errors={[errors.descricao]} />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
