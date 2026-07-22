"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cadastroSchema, type CadastroInput } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { criarContaInicial } from "@/services/empresas.service";

export default function CadastroPage() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({ resolver: zodResolver(cadastroSchema) });

  async function onSubmit(values: CadastroInput) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.senha,
        options: {
          data: { nome_empresa: values.nomeEmpresa, nome: values.nome },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.session) {
        await criarContaInicial(supabase, {
          nomeEmpresa: values.nomeEmpresa,
          nomeUsuario: values.nome,
          email: values.email,
        });
        router.push("/painel");
        router.refresh();
        return;
      }

      setEmailEnviado(true);
    } catch {
      toast.error("Não foi possível concluir o cadastro. Tente novamente.");
    }
  }

  if (emailEnviado) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Confirme seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação. Assim que você confirmar, sua empresa e seu
          acesso à Alocca serão criados automaticamente.
        </p>
        <Button variant="outline" render={<Link href="/entrar" />} className="w-full">
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Criar conta</h2>
        <p className="text-sm text-muted-foreground">
          Configure a Alocca para a sua produtora em poucos minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field data-invalid={!!errors.nomeEmpresa}>
          <FieldLabel htmlFor="nomeEmpresa">Nome da empresa</FieldLabel>
          <Input
            id="nomeEmpresa"
            placeholder="Ex: XYZ Produções"
            {...register("nomeEmpresa")}
          />
          <FieldError errors={[errors.nomeEmpresa]} />
        </Field>

        <Field data-invalid={!!errors.nome}>
          <FieldLabel htmlFor="nome">Seu nome completo</FieldLabel>
          <Input id="nome" placeholder="Ex: Maria Silva" {...register("nome")} />
          <FieldError errors={[errors.nome]} />
        </Field>

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
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/entrar" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
