"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldOff } from "lucide-react";

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
import { formatCPF, formatTelefone } from "@/lib/format";
import { normalizarNomeCompleto, removerNumeros } from "@/lib/validations/nome";
import { ESTADOS_BR } from "@/types";
import { cpfLookupSchema, type CpfLookupInput } from "@/lib/validations/inscricao-publica.schema";
import {
  cadastroFreelancerSchema,
  type CadastroFreelancerInput,
} from "@/lib/validations/cadastro-freelancer.schema";
import {
  buscarFuncionarioPorCpfEmpresa,
  enviarCadastroFreelancer,
  getEmpresaPublica,
  type EmpresaPublica,
} from "@/services/cadastro-freelancer.service";

type Etapa = "cpf" | "formulario" | "sucesso";

export default function CadastroFreelancerPage() {
  const params = useParams<{ empresaId: string }>();

  const [empresa, setEmpresa] = useState<EmpresaPublica | null | undefined>(undefined);
  const [etapa, setEtapa] = useState<Etapa>("cpf");
  const [cpf, setCpf] = useState("");
  const [jaCadastrado, setJaCadastrado] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getEmpresaPublica(supabase, params.empresaId).then(setEmpresa);
  }, [params.empresaId]);

  const cpfForm = useForm<CpfLookupInput>({
    resolver: zodResolver(cpfLookupSchema),
    defaultValues: { cpf: "" },
  });

  const form = useForm<CadastroFreelancerInput>({
    resolver: zodResolver(cadastroFreelancerSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      data_nascimento: "",
      cidade: "",
      estado: "",
      chave_pix: "",
      observacoes: "",
      aceiteLgpd: false,
    },
  });

  async function onSubmitCpf(values: CpfLookupInput) {
    try {
      const supabase = createClient();
      const encontrado = await buscarFuncionarioPorCpfEmpresa(supabase, params.empresaId, values.cpf);
      setCpf(values.cpf);
      if (encontrado) {
        setJaCadastrado(true);
        form.reset({
          nome: encontrado.nome,
          telefone: encontrado.telefone ?? "",
          email: encontrado.email ?? "",
          data_nascimento: encontrado.data_nascimento ?? "",
          cidade: encontrado.cidade ?? "",
          estado: encontrado.estado ?? "",
          chave_pix: encontrado.chave_pix ?? "",
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

  async function onSubmitCadastro(values: CadastroFreelancerInput) {
    try {
      const supabase = createClient();
      await enviarCadastroFreelancer(supabase, params.empresaId, cpf, values);
      setEtapa("sucesso");
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "";
      toast.error(mensagem || "Não foi possível enviar seu cadastro. Tente novamente.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-md">
        {empresa === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : empresa === null ? (
          <EmptyState
            icon={ShieldOff}
            title="Link inválido"
            description="Esse link de cadastro não é válido."
          />
        ) : etapa === "sucesso" ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Cadastro enviado!</h2>
            <p className="text-sm text-muted-foreground">
              Seus dados foram registrados na equipe de freelancers de {empresa.nome}. Você será
              chamado quando surgir uma vaga compatível.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-1 text-xs font-medium text-primary">{empresa.nome}</p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Cadastro de freelancer
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastre seus dados para entrar na equipe de freelancers de {empresa.nome}. Assim
                que surgir uma vaga compatível, você poderá ser convidado diretamente.
              </p>
            </div>

            {etapa === "cpf" ? (
              <form onSubmit={cpfForm.handleSubmit(onSubmitCpf)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Informe seu CPF para começar. Se você já trabalhou com {empresa.nome} antes, seus
                  dados são preenchidos automaticamente.
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
              <form onSubmit={form.handleSubmit(onSubmitCadastro)} className="space-y-4">
                {jaCadastrado ? (
                  <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary">
                    Encontramos seu cadastro! Confira os dados abaixo e atualize se precisar.
                  </p>
                ) : null}

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

                <Field data-invalid={!!form.formState.errors.chave_pix}>
                  <FieldLabel htmlFor="chave_pix">Chave PIX</FieldLabel>
                  <Input
                    id="chave_pix"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    {...form.register("chave_pix")}
                  />
                  <FieldError errors={[form.formState.errors.chave_pix]} />
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
                  Enviar cadastro
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
