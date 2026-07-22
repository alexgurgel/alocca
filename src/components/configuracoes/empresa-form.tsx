"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { FotoUpload } from "@/components/colaboradores/foto-upload";
import type { Empresa } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { atualizarEmpresa } from "@/services/empresas.service";
import { uploadLogoEmpresa } from "@/services/storage.service";

interface EmpresaFormValues {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
}

export function EmpresaForm({ empresa }: { empresa: Empresa }) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(empresa.logo_url);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EmpresaFormValues>({
    defaultValues: {
      nome: empresa.nome,
      cnpj: empresa.cnpj ?? "",
      telefone: empresa.telefone ?? "",
      email: empresa.email ?? "",
      endereco: empresa.endereco ?? "",
    },
  });

  async function onSubmit(values: EmpresaFormValues) {
    try {
      const supabase = createClient();
      let logoUrl: string | undefined;
      if (logoFile) {
        logoUrl = await uploadLogoEmpresa(supabase, empresa.id, logoFile);
      }
      await atualizarEmpresa(supabase, empresa.id, { ...values, ...(logoUrl ? { logo_url: logoUrl } : {}) });
      toast.success("Dados da empresa atualizados.");
    } catch {
      toast.error("Não foi possível salvar as alterações.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <FieldLabel className="mb-2">Logotipo</FieldLabel>
        <FotoUpload
          nome={empresa.nome}
          previewUrl={logoPreview}
          onChange={(file) => {
            setLogoFile(file);
            setLogoPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="nome">Nome da empresa</FieldLabel>
          <Input id="nome" {...register("nome")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cnpj">CNPJ</FieldLabel>
          <Input id="cnpj" {...register("cnpj")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
          <Input id="telefone" {...register("telefone")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="endereco">Endereço</FieldLabel>
          <Input id="endereco" {...register("endereco")} />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
