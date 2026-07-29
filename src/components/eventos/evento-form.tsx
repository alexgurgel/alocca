"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventoSchema, novoEventoSchema, type EventoInput } from "@/lib/validations/evento.schema";
import type { Evento } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { createEvento, updateEvento } from "@/services/eventos.service";

function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function defaultDatetimeLocal(horasOffset: number) {
  const date = new Date();
  date.setHours(date.getHours() + horasOffset, 0, 0, 0);
  return toDatetimeLocal(date.toISOString());
}

function nowDatetimeLocal() {
  return toDatetimeLocal(new Date().toISOString());
}

interface EventoFormProps {
  empresaId: string;
  criadoPor: string | null;
  evento?: Evento;
}

export function EventoForm({ empresaId, criadoPor, evento }: EventoFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventoInput>({
    resolver: zodResolver(evento ? eventoSchema : novoEventoSchema),
    defaultValues: {
      nome: evento?.nome ?? "",
      cliente: evento?.cliente ?? "",
      local: evento?.local ?? "",
      endereco: evento?.endereco ?? "",
      data_inicio: evento ? toDatetimeLocal(evento.data_inicio) : defaultDatetimeLocal(24),
      data_fim: evento ? toDatetimeLocal(evento.data_fim) : defaultDatetimeLocal(28),
      observacoes: evento?.observacoes ?? "",
      status: evento?.status ?? "planejado",
    },
  });

  const dataInicioValue = useWatch({ control, name: "data_inicio" });

  async function onSubmit(values: EventoInput) {
    try {
      const supabase = createClient();
      if (evento) {
        await updateEvento(supabase, evento.id, values);
        toast.success("Evento atualizado.");
        router.push(`/eventos/${evento.id}`);
      } else {
        const criado = await createEvento(supabase, empresaId, criadoPor, values);
        toast.success("Evento criado.");
        router.push(`/eventos/${criado.id}`);
      }
      router.refresh();
    } catch {
      toast.error("Não foi possível salvar o evento.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Informações do evento</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.nome} className="sm:col-span-2">
            <FieldLabel htmlFor="nome">Nome do evento</FieldLabel>
            <Input id="nome" placeholder="Ex: Festival XYZ" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <Field data-invalid={!!errors.cliente}>
            <FieldLabel htmlFor="cliente">Cliente</FieldLabel>
            <Input id="cliente" placeholder="Ex: Produtora ABC" {...register("cliente")} />
            <FieldError errors={[errors.cliente]} />
          </Field>

          <Field data-invalid={!!errors.local}>
            <FieldLabel htmlFor="local">Local</FieldLabel>
            <Input id="local" placeholder="Ex: Espaço Vila Gourmet" {...register("local")} />
            <FieldError errors={[errors.local]} />
          </Field>

          <Field data-invalid={!!errors.endereco} className="sm:col-span-2">
            <FieldLabel htmlFor="endereco">Endereço</FieldLabel>
            <Input id="endereco" placeholder="Rua, número, bairro, cidade" {...register("endereco")} />
            <FieldError errors={[errors.endereco]} />
          </Field>

          <Field data-invalid={!!errors.data_inicio}>
            <FieldLabel htmlFor="data_inicio">Início</FieldLabel>
            <Input
              id="data_inicio"
              type="datetime-local"
              min={evento ? undefined : nowDatetimeLocal()}
              {...register("data_inicio")}
            />
            <FieldError errors={[errors.data_inicio]} />
          </Field>

          <Field data-invalid={!!errors.data_fim}>
            <FieldLabel htmlFor="data_fim">Fim</FieldLabel>
            <Input
              id="data_fim"
              type="datetime-local"
              min={dataInicioValue || undefined}
              {...register("data_fim")}
            />
            <FieldError errors={[errors.data_fim]} />
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  items={{
                    planejado: "Planejado",
                    em_andamento: "Em andamento",
                    finalizado: "Finalizado",
                    cancelado: "Cancelado",
                  }}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea id="observacoes" rows={3} placeholder="Informações adicionais" {...register("observacoes")} />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {evento ? "Salvar alterações" : "Criar evento"}
        </Button>
      </div>
    </form>
  );
}
