"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaInput,
} from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { atualizarSenha } from "@/services/auth.service";

type EstadoSessao = "verificando" | "pronta" | "invalida";

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [estadoSessao, setEstadoSessao] = useState<EstadoSessao>("verificando");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaInput>({ resolver: zodResolver(redefinirSenhaSchema) });

  useEffect(() => {
    async function prepararSessaoDeRecuperacao() {
      const supabase = createClient();
      const code = searchParams.get("code");

      // O link do e-mail chega com ?code=... (fluxo PKCE, igual a confirmacao
      // de cadastro) — sem trocar esse codigo por uma sessao, updateUser()
      // falha porque nao ha ninguem "logado" pra ter a senha trocada. Essa
      // troca nunca estava acontecendo aqui, por isso a pagina sempre dava erro.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setEstadoSessao(error ? "invalida" : "pronta");
        return;
      }

      // Sem "code" na URL: pode ser o fluxo antigo por hash (#access_token=...),
      // que o supabase-js ja processa sozinho ao carregar a pagina. So
      // confirma se, de fato, existe uma sessao ativa.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstadoSessao(user ? "pronta" : "invalida");
    }

    prepararSessaoDeRecuperacao();
  }, [searchParams]);

  async function onSubmit(values: RedefinirSenhaInput) {
    try {
      const supabase = createClient();
      await atualizarSenha(supabase, values.senha);
      toast.success("Senha redefinida com sucesso.");
      window.location.assign("/painel");
    } catch {
      toast.error("Não foi possível redefinir sua senha. Solicite um novo link.");
    }
  }

  if (estadoSessao === "verificando") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (estadoSessao === "invalida") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="size-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Link inválido ou expirado</h2>
        <p className="text-sm text-muted-foreground">
          Esse link de redefinição de senha não é mais válido. Solicite um novo.
        </p>
        <Button variant="outline" render={<Link href="/esqueci-senha" />} className="w-full">
          Pedir novo link
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Criar nova senha</h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma nova senha para acessar sua conta Alocca.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field data-invalid={!!errors.senha}>
          <FieldLabel htmlFor="senha">Nova senha</FieldLabel>
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
          <FieldLabel htmlFor="confirmarSenha">Confirmar nova senha</FieldLabel>
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
          Salvar nova senha
        </Button>
      </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
