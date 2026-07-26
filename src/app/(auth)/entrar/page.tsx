"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { entrar } from "@/services/auth.service";

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    const erro = searchParams.get("erro");
    if (erro === "perfil") {
      toast.error("Não foi possível concluir seu cadastro. Tente se cadastrar novamente.");
    } else if (erro === "auth") {
      toast.error("Não foi possível confirmar seu e-mail. Tente novamente.");
    }
  }, [searchParams]);

  async function onSubmit(values: LoginInput) {
    try {
      const supabase = createClient();
      await entrar(supabase, values.email, values.senha);
      const redirect = searchParams.get("redirect") || "/painel";
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("E-mail ou senha inválidos.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Conecte-se</h2>
        <p className="text-sm text-muted-foreground">
          Acesse o painel de gestão da sua operação.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.senha}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="senha">Senha</FieldLabel>
            <Link
              href="/esqueci-senha"
              className="text-xs font-medium text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}
