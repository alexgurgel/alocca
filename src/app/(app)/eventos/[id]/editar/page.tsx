"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EventoForm } from "@/components/eventos/evento-form";
import { createClient } from "@/lib/supabase/client";
import { getEvento } from "@/services/eventos.service";
import type { Evento } from "@/types";

export default function EditarEventoPage() {
  const params = useParams<{ id: string }>();
  const { perfil } = useAppContext();
  const [evento, setEvento] = useState<Evento | null | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();
    getEvento(supabase, params.id).then((dados) => {
      if (ativo) setEvento(dados);
    });
    return () => {
      ativo = false;
    };
  }, [params.id]);

  if (!evento) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Editar ${evento.nome}`} />
      <div className="mx-auto max-w-3xl">
        <EventoForm empresaId={perfil.empresa_id ?? ""} criadoPor={perfil.id} evento={evento} />
      </div>
    </div>
  );
}
