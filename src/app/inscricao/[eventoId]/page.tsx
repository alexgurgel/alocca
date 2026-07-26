"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Loader2, MapPin, ShieldOff } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { LgpdConsentField } from "@/components/shared/lgpd-consent-field";
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
import { createClient } from "@/lib/supabase/client";
import { formatCPF, formatCurrencyBRL, formatDateTime, formatTelefone } from "@/lib/format";
import { normalizarNomeCompleto, removerNumeros } from "@/lib/validations/nome";
import { ESTADOS_BR } from "@/types";
import {
  cpfLookupSchema,
  inscricaoPublicaSchema,
  type CpfLookupInput,
  type InscricaoPublicaInput,
} from "@/lib/validations/inscricao-publica.schema";
import {
  buscarFuncionarioPorCpf,
  enviarInscricaoPublica,
  getEventoPublico,
  getFuncoesDisponiveisEvento,
  type EventoPublico,
  type FuncaoDisponivel,
} from "@/services/inscricao-publica.service";

type Etapa = "cpf" | "formulario" | "sucesso";

function descricaoFuncao(f: FuncaoDisponivel) {
  const vagas = `${f.vagas_disponiveis} vaga${f.vagas_disponiveis === 1 ? "" : "s"}`;
  const diaria = f.valor_diaria != null ? `${formatCurrencyBRL(f.valor_diaria)}/diária` : "";
  return [f.nome, diaria, `(${vagas})`].filter(Boolean).join(" — ");
}

export default function InscricaoPublicaPage() {
  const params = useParams<{ eventoId: string }>();

  const [evento, setEvento] = useState<EventoPublico | null | undefined>(undefined);
  const [funcoes, setFuncoes] = useState<FuncaoDisponivel[]>([]);
  const [etapa, setEtapa] = useState<Etapa>("cpf");
  const [cpf, setCpf] = useState("");
  const [jaCadastrado, setJaCadastrado] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      getEventoPublico(supabase, params.eventoId),
      getFuncoesDisponiveisEvento(supabase, params.eventoId),
    ]).then(([dadosEvento, dadosFuncoes]) => {
      setEvento(dadosEvento);
      setFuncoes(dadosFuncoes);
    });
  }, [params.eventoId]);

  const cpfForm = useForm<CpfLookupInput>({
    resolver: zodResolver(cpfLookupSchema),
    defaultValues: { cpf: "" },
  });

  const form = useForm<InscricaoPublicaInput>({
    resolver: zodResolver(inscricaoPublicaSchema),
    defaultValues: {
      funcao_id: "",
      nome: "",
      telefone: "",
      email: "",
      data_nascimento: "",
      cidade: "",
      estado: "",
      observacoes: "",
      aceiteLgpd: false,
    },
  });

  async function onSubmitCpf(values: CpfLookupInput) {
    try {
      const supabase = createClient();
      const encontrado = await buscarFuncionarioPorCpf(supabase, params.eventoId, values.cpf);
      setCpf(values.cpf);
      if (encontrado) {
        setJaCadastrado(true);
        form.reset({
          funcao_id: "",
          nome: encontrado.nome,
          telefone: encontrado.telefone ?? "",
          email: encontrado.email ?? "",
          data_nascimento: encontrado.data_nascimento ?? "",
          cidade: encontrado.cidade ?? "",
          estado: encontrado.estado ?? "",
          observacoes: encontrado.observacoes ?? "",
          aceiteLgpd: false,
        });
      } else {
        setJaCadastrado(false);
      }
      setEtapa("formulario");
    } catch {
      toast.error("Não foi possível verificar o CPF. Tente novamente.");
    }
  }

  async function onSubmitInscricao(values: InscricaoPublicaInput) {
    try {
      const supabase = createClient();
      await enviarInscricaoPublica(supabase, params.eventoId, cpf, values);
      setEtapa("sucesso");
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "";
      toast.error(mensagem || "Não foi possível enviar sua candidatura. Tente novamente.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-md">
        {evento === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : evento === null ? (
          <EmptyState
            icon={ShieldOff}
            title="Inscrições encerradas"
            description="Esse link não está mais aceitando candidaturas, ou o evento não existe."
          />
        ) : etapa === "sucesso" ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Candidatura enviada!</h2>
            <p className="text-sm text-muted-foreground">
              Recebemos sua candidatura para {evento.nome}. Aguarde a aprovação do produtor —
              você será avisado quando houver uma resposta.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-1 text-xs font-medium text-primary">{evento.empresa_nome}</p>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                {evento.nome}
              </h2>

              <div className="space-y-3">
                {evento.local || evento.endereco ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {evento.local || "Local a definir"}
                      </p>
                      {evento.endereco ? (
                        <p className="text-sm text-muted-foreground">{evento.endereco}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDateTime(evento.data_inicio)}
                    </p>
                    <p className="text-sm text-muted-foreground">até {formatDateTime(evento.data_fim)}</p>
                  </div>
                </div>

              </div>
            </div>

            {funcoes.length === 0 ? (
              <EmptyState
                icon={ShieldOff}
                title="Sem vagas no momento"
                description="Todas as vagas deste evento já foram preenchidas."
              />
            ) : etapa === "cpf" ? (
              <form onSubmit={cpfForm.handleSubmit(onSubmitCpf)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Informe seu CPF para começar. Se você já trabalhou com{" "}
                  {evento.empresa_nome} antes, seus dados são preenchidos automaticamente.
                </p>
                <Field data-invalid={!!cpfForm.formState.errors.cpf}>
                  <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                  <Controller
                    control={cpfForm.control}
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
                  <FieldError errors={[cpfForm.formState.errors.cpf]} />
                </Field>
                <Button type="submit" className="w-full" disabled={cpfForm.formState.isSubmitting}>
                  {cpfForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Continuar
                </Button>
              </form>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmitInscricao)} className="space-y-4">
                {jaCadastrado ? (
                  <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary">
                    Encontramos seu cadastro! Confira os dados abaixo e atualize se precisar.
                  </p>
                ) : null}

                <Field data-invalid={!!form.formState.errors.funcao_id}>
                  <FieldLabel htmlFor="funcao_id">Função</FieldLabel>
                  <Controller
                    control={form.control}
                    name="funcao_id"
                    render={({ field }) => (
                      <Select
                        items={Object.fromEntries(funcoes.map((f) => [f.funcao_id, descricaoFuncao(f)]))}
                        value={field.value}
                        onValueChange={(v: string | null) =>
                          form.setValue("funcao_id", v ?? "", { shouldValidate: true, shouldDirty: true })
                        }
                      >
                        <SelectTrigger id="funcao_id" className="w-full">
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          {funcoes.map((f) => (
                            <SelectItem key={f.funcao_id} value={f.funcao_id}>
                              {descricaoFuncao(f)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[form.formState.errors.funcao_id]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.nome}>
                  <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
                  <Controller
                    control={form.control}
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
                  <FieldError errors={[form.formState.errors.nome]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="cpf_confirmado">CPF</FieldLabel>
                  <Input id="cpf_confirmado" value={cpf} disabled />
                </Field>

                <Field data-invalid={!!form.formState.errors.data_nascimento}>
                  <FieldLabel htmlFor="data_nascimento">Data de nascimento</FieldLabel>
                  <Input id="data_nascimento" type="date" {...form.register("data_nascimento")} />
                  <FieldError errors={[form.formState.errors.data_nascimento]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.telefone}>
                  <FieldLabel htmlFor="telefone">Telefone (WhatsApp)</FieldLabel>
                  <Controller
                    control={form.control}
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
                  <FieldError errors={[form.formState.errors.telefone]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input id="email" type="email" placeholder="voce@email.com" {...form.register("email")} />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.cidade}>
                  <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                  <Input id="cidade" placeholder="Ex: São Paulo" {...form.register("cidade")} />
                  <FieldError errors={[form.formState.errors.cidade]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.estado}>
                  <FieldLabel htmlFor="estado">Estado</FieldLabel>
                  <Controller
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <Select
                        items={Object.fromEntries(ESTADOS_BR.map((uf) => [uf, uf]))}
                        value={field.value}
                        onValueChange={(v: string | null) =>
                          form.setValue("estado", v ?? "", { shouldValidate: true, shouldDirty: true })
                        }
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
                  <FieldError errors={[form.formState.errors.estado]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
                  <Textarea id="observacoes" rows={3} {...form.register("observacoes")} />
                </Field>

                <Controller
                  control={form.control}
                  name="aceiteLgpd"
                  render={({ field }) => (
                    <LgpdConsentField
                      id="aceiteLgpd"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      error={form.formState.errors.aceiteLgpd}
                    />
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Enviar candidatura
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
