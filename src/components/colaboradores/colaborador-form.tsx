"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import { FotoUpload } from "./foto-upload";
import { FuncoesMultiselect } from "./funcoes-multiselect";
import { colaboradorSchema, type ColaboradorInput } from "@/lib/validations/colaborador.schema";
import { normalizarNomeCompleto, removerNumeros } from "@/lib/validations/nome";
import { formatCPF, formatTelefone } from "@/lib/format";
import { ESTADOS_BR } from "@/types";
import type { Funcao, FuncionarioComFuncoes } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { createFuncionario, updateFuncionario } from "@/services/funcionarios.service";
import { uploadFotoColaborador } from "@/services/storage.service";

interface ColaboradorFormProps {
  empresaId: string;
  funcoes: Funcao[];
  colaborador?: FuncionarioComFuncoes;
}

export function ColaboradorForm({ empresaId, funcoes, colaborador }: ColaboradorFormProps) {
  const router = useRouter();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(colaborador?.foto_url ?? null);
  const [fotoRemovida, setFotoRemovida] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ColaboradorInput>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      nome: colaborador?.nome ?? "",
      cpf: colaborador?.cpf ?? "",
      telefone: colaborador?.telefone ?? "",
      email: colaborador?.email ?? "",
      data_nascimento: colaborador?.data_nascimento ?? "",
      cidade: colaborador?.cidade ?? "",
      estado: colaborador?.estado ?? "",
      chave_pix: colaborador?.chave_pix ?? "",
      observacoes: colaborador?.observacoes ?? "",
      status: colaborador?.status ?? "ativo",
      funcao_ids: colaborador?.funcoes.map((f) => f.id) ?? [],
    },
  });

  function handleFotoChange(file: File | null) {
    setFotoFile(file);
    setFotoRemovida(file === null);
    setFotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(values: ColaboradorInput) {
    try {
      const supabase = createClient();

      let fotoUrl: string | null | undefined = undefined;
      if (fotoFile) {
        fotoUrl = await uploadFotoColaborador(supabase, empresaId, fotoFile);
      } else if (fotoRemovida) {
        fotoUrl = null;
      }

      if (colaborador) {
        await updateFuncionario(supabase, colaborador.id, values, fotoUrl);
        toast.success("Freelancer atualizado.");
      } else {
        await createFuncionario(supabase, empresaId, values, fotoUrl);
        toast.success("Freelancer cadastrado.");
      }

      router.push("/colaboradores");
      router.refresh();
    } catch {
      toast.error("Não foi possível salvar o freelancer.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Foto</h3>
        <FotoUpload nome={colaborador?.nome ?? ""} previewUrl={fotoPreview} onChange={handleFotoChange} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Dados pessoais</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.nome} className="sm:col-span-2">
            <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <Input
                  id="nome"
                  placeholder="Ex: João da Silva"
                  value={field.value}
                  onChange={(e) => field.onChange(removerNumeros(e.target.value))}
                  onBlur={() => field.onChange(normalizarNomeCompleto(field.value ?? ""))}
                />
              )}
            />
            <FieldError errors={[errors.nome]} />
          </Field>

          <Field data-invalid={!!errors.cpf}>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={field.value}
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                />
              )}
            />
            <FieldError errors={[errors.cpf]} />
          </Field>

          <Field data-invalid={!!errors.data_nascimento}>
            <FieldLabel htmlFor="data_nascimento">Data de nascimento</FieldLabel>
            <Input id="data_nascimento" type="date" {...register("data_nascimento")} />
            <FieldError errors={[errors.data_nascimento]} />
          </Field>

          <Field data-invalid={!!errors.telefone}>
            <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={field.value}
                  onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                />
              )}
            />
            <FieldError errors={[errors.telefone]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input id="email" type="email" placeholder="freelancer@email.com" {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.cidade}>
            <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
            <Input id="cidade" placeholder="Ex: São Paulo" {...register("cidade")} />
            <FieldError errors={[errors.cidade]} />
          </Field>

          <Field data-invalid={!!errors.estado}>
            <FieldLabel htmlFor="estado">Estado</FieldLabel>
            <Controller
              control={control}
              name="estado"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries(ESTADOS_BR.map((uf) => [uf, uf]))}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="estado" className="w-full">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.estado]} />
          </Field>

          <Field data-invalid={!!errors.chave_pix} className="sm:col-span-2">
            <FieldLabel htmlFor="chave_pix">Chave PIX</FieldLabel>
            <Input id="chave_pix" placeholder="CPF, e-mail, telefone ou chave aleatória" {...register("chave_pix")} />
            <FieldError errors={[errors.chave_pix]} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Funções e status</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>Funções</FieldLabel>
            <Controller
              control={control}
              name="funcao_ids"
              render={({ field }) => (
                <FuncoesMultiselect
                  funcoes={funcoes}
                  selecionadas={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  items={{ ativo: "Ativo", inativo: "Inativo" }}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea
              id="observacoes"
              rows={3}
              placeholder="Informações adicionais sobre o freelancer"
              {...register("observacoes")}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/colaboradores")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {colaborador ? "Salvar alterações" : "Cadastrar freelancer"}
        </Button>
      </div>
    </form>
  );
}
