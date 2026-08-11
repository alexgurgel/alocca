"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MailCheck, ShieldOff } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import {
  aceitarConviteEquipeSchema,
  type AceitarConviteEquipeInput,
} from "@/lib/validations/auth.schema";
import {
  aceitarConviteEquipe,
  obterConviteEquipe,
  type ConviteEquipePublico,
} from "@/services/equipe.service";

export default function AceitarConviteEquipePage() {
  const params = useParams<{ token: string }>();

  const [convite, setConvite] = useState<ConviteEquipePublico | null | undefined>(undefined);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();
    obterConviteEquipe(supabase, params.token).then((dados) => {
      if (ativo) setConvite(dados);
    });
    return () => {
      ativo = false;
    };
  }, [params.token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AceitarConviteEquipeInput>({
    resolver: zodResolver(aceitarConviteEquipeSchema),
    defaultValues: { nome: "", senha: "", confirmarSenha: "" },
  });

  async function onSubmit(values: AceitarConviteEquipeInput) {
    if (!convite) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: convite.email,
        password: values.senha,
        options: {
          data: { convite_equipe_token: params.token, nome: values.nome },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.session) {
        await aceitarConviteEquipe(supabase, params.token, values.nome);
        window.location.assign("/painel");
        return;
      }

      setEmailEnviado(true);
    } catch {
      toast.error("Não foi possível concluir o cadastro. Tente novamente.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-md">
        {convite === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : convite === null ? (
          <EmptyState
            icon={ShieldOff}
            title="Convite indisponível"
            description="Esse link de convite não é mais válido, já foi usado ou expirou."
          />
        ) : emailEnviado ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Confirme seu e-mail</h2>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmação para {convite.email}. Assim que você confirmar, seu
              acesso à equipe de {convite.empresaNome} será liberado.
            </p>
            <Button variant="outline" render={<Link href="/entrar" />} className="w-full">
              Voltar para o login
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-1.5 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Entrar para a equipe</h2>
              <p className="text-sm text-muted-foreground">
                Crie sua senha para acessar a conta de <strong>{convite.empresaNome}</strong> na
                Alocca.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input id="email" value={convite.email} disabled />
              </Field>

              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Seu nome completo</FieldLabel>
                <Input id="nome" placeholder="Ex: Maria Silva" {...register("nome")} />
                <FieldError errors={[errors.nome]} />
              </Field>

              <Field data-invalid={!!errors.senha}>
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className="pr-9"
                    {...register("senha")}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError errors={[errors.senha]} />
              </Field>

              <Field data-invalid={!!errors.confirmarSenha}>
                <FieldLabel htmlFor="confirmarSenha">Confirmar senha</FieldLabel>
                <Input
                  id="confirmarSenha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  {...register("confirmarSenha")}
                />
                <FieldError errors={[errors.confirmarSenha]} />
              </Field>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Criar acesso
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
