"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { convidarUsuarioSchema, type ConvidarUsuarioInput } from "@/lib/validations/equipe.schema";

interface ConvidarUsuarioDialogProps {
  onConvidar: (email: string) => Promise<unknown>;
  disabled?: boolean;
}

export function ConvidarUsuarioDialog({ onConvidar, disabled }: ConvidarUsuarioDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConvidarUsuarioInput>({
    resolver: zodResolver(convidarUsuarioSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ConvidarUsuarioInput) {
    await onConvidar(values.email);
    reset({ email: "" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <UserPlus />
        Adicionar usuário
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar usuário para a equipe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input id="email" type="email" placeholder="pessoa@email.com" {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>

          <p className="text-xs text-muted-foreground">
            Enviaremos um link por e-mail para essa pessoa criar a senha dela e acessar a mesma
            conta da sua empresa.
          </p>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
