"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  esqueciSenhaSchema,
  type EsqueciSenhaInput,
} from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { enviarEmailRedefinirSenha } from "@/services/auth.service";

export default function EsqueciSenhaPage() {
  const [enviado, setEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaInput>({ resolver: zodResolver(esqueciSenhaSchema) });

  async function onSubmit(values: EsqueciSenhaInput) {
    try {
      const supabase = createClient();
      await enviarEmailRedefinirSenha(supabase, values.email);
      setEnviado(true);
    } catch {
      toast.error("Não foi possível enviar o e-mail de redefinição.");
    }
  }

  if (enviado) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Verifique seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um link para redefinir sua senha. Ele expira em breve, então utilize-o
          assim que possível.
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
        <Link
          href="/entrar"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Voltar
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight">Esqueci minha senha</h2>
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para você criar uma nova senha.
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Enviar link de redefinição
        </Button>
      </form>
    </div>
  );
}
