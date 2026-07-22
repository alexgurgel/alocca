"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FotoUpload } from "@/components/colaboradores/foto-upload";
import { createClient } from "@/lib/supabase/client";
import { atualizarPerfil } from "@/services/perfis.service";
import { uploadFotoColaborador } from "@/services/storage.service";

interface PerfilFormValues {
  nome: string;
  telefone: string;
}

export default function PerfilPage() {
  const { perfil } = useAppContext();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(perfil.avatar_url);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PerfilFormValues>({
    defaultValues: { nome: perfil.nome, telefone: perfil.telefone ?? "" },
  });

  async function onSubmit(values: PerfilFormValues) {
    try {
      const supabase = createClient();
      let avatarUrl: string | undefined;
      if (fotoFile && perfil.empresa_id) {
        avatarUrl = await uploadFotoColaborador(supabase, perfil.empresa_id, fotoFile);
      }
      await atualizarPerfil(supabase, perfil.id, {
        ...values,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });
      toast.success("Perfil atualizado.");
    } catch {
      toast.error("Não foi possível atualizar seu perfil.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Suas informações pessoais na Alocca." />

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FieldLabel className="mb-2">Foto</FieldLabel>
            <FotoUpload
              nome={perfil.nome}
              previewUrl={fotoPreview}
              onChange={(file) => {
                setFotoFile(file);
                setFotoPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
              <Input id="nome" {...register("nome")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" value={perfil.email} disabled />
            </Field>

            <Field>
              <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
              <Input id="telefone" {...register("telefone")} />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
