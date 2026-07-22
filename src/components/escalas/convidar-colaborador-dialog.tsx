"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  convidarColaboradorSchema,
  type ConvidarColaboradorInput,
} from "@/lib/validations/escala.schema";
import { createClient } from "@/lib/supabase/client";
import { listFuncionariosAtivos } from "@/services/funcionarios.service";
import { cn } from "@/lib/utils";
import type { Funcionario } from "@/types";

interface ConvidarColaboradorDialogProps {
  empresaId: string;
  funcaoNome: string;
  idsJaConvidados: string[];
  valorPadrao?: number | null;
  onConvidar: (input: ConvidarColaboradorInput) => Promise<void>;
}

export function ConvidarColaboradorDialog({
  empresaId,
  funcaoNome,
  idsJaConvidados,
  valorPadrao,
  onConvidar,
}: ConvidarColaboradorDialogProps) {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Funcionario[]>([]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    listFuncionariosAtivos(supabase, empresaId).then(setColaboradores);
  }, [open, empresaId]);

  const disponiveis = useMemo(
    () => colaboradores.filter((c) => !idsJaConvidados.includes(c.id)),
    [colaboradores, idsJaConvidados]
  );

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConvidarColaboradorInput>({
    resolver: zodResolver(convidarColaboradorSchema),
    defaultValues: {
      funcionario_id: "",
      valor_diaria: valorPadrao ? String(valorPadrao) : "",
      observacoes: "",
    },
  });

  const funcionarioIdSelecionado = useWatch({ control, name: "funcionario_id" });
  const funcionarioSelecionado = colaboradores.find((c) => c.id === funcionarioIdSelecionado);

  async function onSubmit(values: ConvidarColaboradorInput) {
    await onConvidar(values);
    reset({ funcionario_id: "", valor_diaria: valorPadrao ? String(valorPadrao) : "", observacoes: "" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <UserPlus />
        Convidar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar colaborador · {funcaoNome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.funcionario_id}>
            <FieldLabel>Colaborador</FieldLabel>
            <Controller
              control={control}
              name="funcionario_id"
              render={({ field }) => (
                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                  <PopoverTrigger
                    render={
                      <Button type="button" variant="outline" className="w-full justify-between font-normal" />
                    }
                  >
                    {funcionarioSelecionado ? funcionarioSelecionado.nome : (
                      <span className="text-muted-foreground">Selecione um colaborador</span>
                    )}
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                  </PopoverTrigger>
                  <PopoverContent className="w-(--anchor-width) p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar colaborador..." />
                      <CommandList>
                        <CommandEmpty>Nenhum colaborador disponível.</CommandEmpty>
                        <CommandGroup>
                          {disponiveis.map((colaborador) => (
                            <CommandItem
                              key={colaborador.id}
                              onSelect={() => {
                                field.onChange(colaborador.id);
                                setComboOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "size-4",
                                  field.value === colaborador.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {colaborador.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError errors={[errors.funcionario_id]} />
          </Field>

          <Field data-invalid={!!errors.valor_diaria}>
            <FieldLabel htmlFor="valor_diaria">Valor da diária (R$)</FieldLabel>
            <Input id="valor_diaria" type="number" step="0.01" min="0" {...register("valor_diaria")} />
            <FieldError errors={[errors.valor_diaria]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea id="observacoes" rows={2} {...register("observacoes")} />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
