"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toggleListaPublica } from "@/services/eventos.service";
import type { Evento } from "@/types";

export function ListaPublicaCard({
  evento,
  onAtualizado,
}: {
  evento: Evento;
  onAtualizado: (evento: Evento) => void;
}) {
  const [salvando, setSalvando] = useState(false);

  async function alternar(ativa: boolean) {
    setSalvando(true);
    try {
      const supabase = createClient();
      const atualizado = await toggleListaPublica(supabase, evento.id, ativa);
      onAtualizado(atualizado);
      toast.success(ativa ? "Lista pública de confirmados ativada." : "Lista pública de confirmados desativada.");
    } catch {
      toast.error("Não foi possível atualizar a lista pública.");
    } finally {
      setSalvando(false);
    }
  }

  async function copiarLink() {
    const link = `${window.location.origin}/lista-confirmados/${evento.id}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link da lista de confirmados copiado.");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Lista pública de confirmados</h3>
          <p className="text-xs text-muted-foreground">
            Gera um link somente leitura, atualizado automaticamente, com os freelancers já
            confirmados para este evento — sem acesso ao painel administrativo.
          </p>
        </div>
        <Switch checked={evento.lista_publica_ativa} onCheckedChange={alternar} disabled={salvando} />
      </div>

      {evento.lista_publica_ativa ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={copiarLink}>
          <Link2 />
          Copiar link da lista
        </Button>
      ) : null}
    </div>
  );
}
