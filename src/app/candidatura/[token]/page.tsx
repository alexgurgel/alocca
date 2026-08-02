"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { CalendarDays, Loader2, MapPin, Search, Send, UserPlus2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { EventoStatusBadge } from "@/components/eventos/evento-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { formatCPF, formatDateTime, formatTelefone } from "@/lib/format";
import {
  candidaturaPublicaSchema,
  type CandidaturaPublicaInput,
} from "@/lib/validations/candidatura.schema";
import { ESTADOS_BR } from "@/types";
import {
  buscarCadastroPublicoEvento,
  enviarCandidaturaPublica,
  getEventoCandidaturaPublica,
  type EventoCandidaturaPublica,
} from "@/services/candidaturas.service";

function apenasDigitos(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export default function CandidaturaPublicaPage() {
  const params = useParams<{ token: string }>();
  const [evento, setEvento] = useState<EventoCandidaturaPublica | null | undefined>(undefined);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemCadastro, setMensagemCadastro] = useState<string | null>(null);
  const [jaCadastradoEvento, setJaCadastradoEvento] = useState(false);
  const [buscandoCadastro, setBuscandoCadastro] = useState(false);
  const ultimaConsultaRef = useRef<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CandidaturaPublicaInput>({
    resolver: zodResolver(candidaturaPublicaSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      data_nascimento: "",
      cidade: "",
      estado: "",
      funcao_id: "",
      observacoes: "",
      lgpd_aceito: false,
    },
  });

  const cpf = useWatch({ control, name: "cpf" });
  const telefone = useWatch({ control, name: "telefone" });
  const email = useWatch({ control, name: "email" });

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();

    async function carregar() {
      try {
        const dados = await getEventoCandidaturaPublica(supabase, params.token);
        if (!ativo) return;

        setEvento(dados);
        if (dados?.funcoes[0]) {
          setValue("funcao_id", dados.funcoes[0].id);
        }
      } catch {
        if (!ativo) return;
        setEvento(null);
        toast.error("Nao foi possivel carregar a pagina de candidatura.");
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [params.token, setValue]);

  useEffect(() => {
    let ativo = true;
    const cpfDigits = apenasDigitos(cpf);
    const telefoneDigits = apenasDigitos(telefone);
    const emailValue = email?.trim().toLowerCase() ?? "";

    if (cpfDigits.length !== 11 || (!emailValue && telefoneDigits.length < 10)) {
      setBuscandoCadastro(false);
      setMensagemCadastro(null);
      setJaCadastradoEvento(false);
      ultimaConsultaRef.current = null;
      return;
    }

    const chaveConsulta = `${cpfDigits}|${emailValue}|${telefoneDigits}`;
    if (ultimaConsultaRef.current === chaveConsulta) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setBuscandoCadastro(true);
        const supabase = createClient();
        const cadastro = await buscarCadastroPublicoEvento(supabase, params.token, {
          cpf: cpfDigits,
          email: emailValue || undefined,
          telefone: telefoneDigits || undefined,
        });

        if (!ativo) return;
        ultimaConsultaRef.current = chaveConsulta;

        if (!cadastro) {
          setMensagemCadastro(null);
          setJaCadastradoEvento(false);
          return;
        }

        if (cadastro.nome) setValue("nome", cadastro.nome, { shouldDirty: false });
        if (cadastro.cpf) setValue("cpf", formatCPF(cadastro.cpf), { shouldDirty: false });
        if (cadastro.telefone) {
          setValue("telefone", formatTelefone(cadastro.telefone), { shouldDirty: false });
        }
        if (cadastro.email) setValue("email", cadastro.email, { shouldDirty: false });
        if (cadastro.dataNascimento) {
          setValue("data_nascimento", cadastro.dataNascimento.slice(0, 10), { shouldDirty: false });
        }
        if (cadastro.cidade) setValue("cidade", cadastro.cidade, { shouldDirty: false });
        if (cadastro.estado) setValue("estado", cadastro.estado, { shouldDirty: false });

        if (cadastro.jaCadastradoEvento) {
          setMensagemCadastro("Voce ja realizou o cadastro para este evento.");
          setJaCadastradoEvento(true);
          return;
        }

        setMensagemCadastro("Encontramos seu cadastro e preenchemos seus dados automaticamente.");
        setJaCadastradoEvento(false);
      } catch {
        if (!ativo) return;
        setMensagemCadastro(null);
        setJaCadastradoEvento(false);
      } finally {
        if (ativo) {
          setBuscandoCadastro(false);
        }
      }
    }, 500);

    return () => {
      ativo = false;
      window.clearTimeout(timeout);
    };
  }, [cpf, email, params.token, setValue, telefone]);

  const mapaUrl = useMemo(() => {
    if (!evento) return null;
    const enderecoBusca = evento.endereco || evento.local;
    if (!enderecoBusca) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoBusca)}`;
  }, [evento]);

  async function onSubmit(values: CandidaturaPublicaInput) {
    try {
      const supabase = createClient();
      await enviarCandidaturaPublica(supabase, params.token, values);
      const funcao = evento?.funcoes.find((item) => item.id === values.funcao_id);

      setMensagemSucesso(
        funcao
          ? `Sua candidatura para ${funcao.nome} foi enviada com sucesso.`
          : "Sua candidatura foi enviada com sucesso."
      );
      setMensagemCadastro(null);
      setJaCadastradoEvento(false);
      ultimaConsultaRef.current = null;
      reset({
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        data_nascimento: "",
        cidade: "",
        estado: "",
        funcao_id: values.funcao_id,
        observacoes: "",
        lgpd_aceito: false,
      });
      toast.success("Candidatura enviada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel enviar a candidatura.";
      toast.error(message);
    }
  }

  if (evento === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={UserPlus2}
          title="Pagina de candidatura nao encontrada"
          description="Confira se o link esta correto ou solicite um novo compartilhamento do evento."
          action={
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Voltar ao inicio
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={evento.nome}
        description="Escolha a funcao desejada e envie sua candidatura para este evento."
      />

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <EventoStatusBadge status={evento.status} />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formatDateTime(evento.dataInicio)} ate {formatDateTime(evento.dataFim)}
          </span>
        </div>

        {evento.local || evento.endereco ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span>{[evento.local, evento.endereco].filter(Boolean).join(" · ")}</span>
            {mapaUrl ? (
              <a
                href={mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Ver no mapa
              </a>
            ) : null}
          </div>
        ) : null}

        {evento.observacoes ? (
          <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
            {evento.observacoes}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Funcoes disponiveis</h2>
            <p className="text-xs text-muted-foreground">
              Escolha a funcao mais adequada ao seu perfil.
            </p>
          </div>

          <div className="space-y-3">
            {evento.funcoes.map((funcao) => (
              <div
                key={funcao.id}
                className="rounded-2xl border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{funcao.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {funcao.confirmados} confirmados · {funcao.pendentes} convites pendentes
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {funcao.vagas} vaga{funcao.vagas === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Enviar candidatura</h2>
            <p className="text-xs text-muted-foreground">
              Seus dados vao para a equipe responsavel aprovar e depois montar a escala.
            </p>
          </div>

          {mensagemSucesso ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {mensagemSucesso}
            </div>
          ) : null}

          {mensagemCadastro ? (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                jaCadastradoEvento
                  ? "border border-amber-200 bg-amber-50 text-amber-800"
                  : "border border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {buscandoCadastro ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                {mensagemCadastro}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={!!errors.funcao_id}>
              <FieldLabel htmlFor="funcao_id">Funcao desejada</FieldLabel>
              <Controller
                control={control}
                name="funcao_id"
                render={({ field }) => (
                  <Select
                    items={Object.fromEntries(evento.funcoes.map((funcao) => [funcao.id, funcao.nome]))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="funcao_id" className="w-full">
                      <SelectValue placeholder="Selecione a funcao" />
                    </SelectTrigger>
                    <SelectContent>
                      {evento.funcoes.map((funcao) => (
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

            <Field data-invalid={!!errors.nome}>
              <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
              <Input id="nome" placeholder="Seu nome completo" {...register("nome")} />
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
                    onChange={(event) => field.onChange(formatCPF(event.target.value))}
                  />
                )}
              />
              <FieldError errors={[errors.cpf]} />
            </Field>

            <Field data-invalid={!!errors.telefone}>
              <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
              <Controller
                control={control}
                name="telefone"
                render={({ field }) => (
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={field.value}
                    onChange={(event) => field.onChange(formatTelefone(event.target.value))}
                  />
                )}
              />
              <FieldError errors={[errors.telefone]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" type="email" placeholder="voce@exemplo.com" {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.data_nascimento}>
              <FieldLabel htmlFor="data_nascimento">Data de nascimento</FieldLabel>
              <Input id="data_nascimento" type="date" {...register("data_nascimento")} />
              <FieldError errors={[errors.data_nascimento]} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.cidade}>
                <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                <Input id="cidade" placeholder="Sua cidade" {...register("cidade")} />
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
                      value={field.value || undefined}
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
            </div>

            <Field>
              <FieldLabel htmlFor="observacoes">Observacoes</FieldLabel>
              <Textarea
                id="observacoes"
                rows={4}
                placeholder="Conte sua experiencia, disponibilidade ou qualquer detalhe importante."
                {...register("observacoes")}
              />
            </Field>

            <Field data-invalid={!!errors.lgpd_aceito} orientation="horizontal">
              <Controller
                control={control}
                name="lgpd_aceito"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    aria-invalid={!!errors.lgpd_aceito}
                  />
                )}
              />
              <div className="flex-1">
                <FieldLabel>
                  Autorizo o uso dos meus dados para avaliacao desta candidatura, contato e formacao de escala do evento.
                </FieldLabel>
                <FieldError errors={[errors.lgpd_aceito]} />
              </div>
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting || jaCadastradoEvento}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send />}
              {jaCadastradoEvento ? "Cadastro ja realizado" : "Enviar candidatura"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
