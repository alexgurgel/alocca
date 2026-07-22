"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaInput,
} from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { atualizarSenha } from "@/services/auth.service";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaInput>({ resolver: zodResolver(redefinirSenhaSchema) });

  async function onSubmit(values: RedefinirSenhaInput) {
    try {
      const supabase = createClient();
      await atualizarSenha(supabase, values.senha);
      toast.success("Senha redefinida com sucesso.");
      router.push("/painel");
      router.refresh();
    } catch {
      toast.error("Não foi possível redefinir sua senha. Solicite um novo link.");
    }
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
