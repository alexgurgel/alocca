"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
  vagasPreenchidas?: boolean;
  onConvidar: (input: ConvidarColaboradorInput) => Promise<void>;
}

export function ConvidarColaboradorDialog({
  empresaId,
  funcaoNome,
  idsJaConvidados,
  valorPadrao,
  vagasPreenchidas = false,
  onConvidar,
}: ConvidarColaboradorDialogProps) {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [freelancers, setFreelancers] = useState<Funcionario[]>([]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    listFuncionariosAtivos(supabase, empresaId).then(setFreelancers);
  }, [open, empresaId]);

  const disponiveis = useMemo(
    () => freelancers.filter((c) => !idsJaConvidados.includes(c.id)),
    [freelancers, idsJaConvidados]
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
      funcionario_ids: [],
      valor_diaria: valorPadrao ? String(valorPadrao) : "",
      observacoes: "",
    },
  });

  const idsSelecionados = useWatch({ control, name: "funcionario_ids" }) ?? [];
  const freelancersSelecionados = freelancers.filter((c) => idsSelecionados.includes(c.id));

  function handleAbrir() {
    if (vagasPreenchidas) {
      toast.error(`As vagas de ${funcaoNome} já estão 100% preenchidas.`);
      return;
    }
    setOpen(true);
  }

  async function onSubmit(values: ConvidarColaboradorInput) {
    await onConvidar(values);
    reset({ funcionario_ids: [], valor_diaria: valorPadrao ? String(valorPadrao) : "", observacoes: "" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" size="sm" variant="outline" onClick={handleAbrir}>
        <UserPlus />
        Convidar
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar freelancer · {funcaoNome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.funcionario_ids}>
            <FieldLabel>Freelancers</FieldLabel>
            <Controller
              control={control}
              name="funcionario_ids"
              render={({ field }) => (
                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto min-h-9 w-full justify-between font-normal"
                      />
                    }
                  >
                    <span className="flex flex-wrap items-center gap-1 text-left">
                      {freelancersSelecionados.length === 0 ? (
                        <span className="text-muted-foreground">Selecione um ou mais freelancers</span>
                      ) : (
                        freelancersSelecionados.map((f) => (
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
                      <CommandInput placeholder="Buscar freelancer..." />
                      <CommandList>
                        <CommandEmpty>Nenhum freelancer disponível.</CommandEmpty>
                        <CommandGroup>
                          {disponiveis.map((freelancer) => {
                            const marcado = field.value?.includes(freelancer.id) ?? false;
                            return (
                              <CommandItem
                                key={freelancer.id}
                                onSelect={() => {
                                  field.onChange(
                                    marcado
                                      ? field.value.filter((id: string) => id !== freelancer.id)
                                      : [...(field.value ?? []), freelancer.id]
                                  );
                                }}
                              >
                                <Check className={cn("size-4", marcado ? "opacity-100" : "opacity-0")} />
                                {freelancer.nome}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError errors={[errors.funcionario_ids]} />
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
