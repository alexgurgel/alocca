"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EventoForm } from "@/components/eventos/evento-form";

export default function NovoEventoPage() {
  const { perfil } = useAppContext();

  return (
    <div className="space-y-6">
      <PageHeader title="Novo evento" description="Cadastre um novo evento para começar a montar a escala." />
      <div className="mx-auto max-w-3xl">
        <EventoForm empresaId={perfil.empresa_id ?? ""} criadoPor={perfil.id} />
      </div>
    </div>
  );
}
