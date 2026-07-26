"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toggleInscricaoPublica } from "@/services/eventos.service";
import type { Evento } from "@/types";

export function InscricaoPublicaCard({
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
      const atualizado = await toggleInscricaoPublica(supabase, evento.id, ativa);
      onAtualizado(atualizado);
      toast.success(ativa ? "Inscrição pública ativada." : "Inscrição pública desativada.");
    } catch {
      toast.error("Não foi possível atualizar a inscrição pública.");
    } finally {
      setSalvando(false);
    }
  }

  async function copiarLink() {
    const link = `${window.location.origin}/inscricao/${evento.id}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link de inscrição copiado.");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Inscrição pública</h3>
          <p className="text-xs text-muted-foreground">
            Gera um link para freelancers ainda não cadastrados se candidatarem às vagas
            deste evento. As candidaturas entram como pendentes até você aprovar.
          </p>
        </div>
        <Switch
          checked={evento.inscricao_publica_ativa}
          onCheckedChange={alternar}
          disabled={salvando}
        />
      </div>

      {evento.inscricao_publica_ativa ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={copiarLink}>
          <Link2 />
          Copiar link de inscrição
        </Button>
      ) : null}
    </div>
  );
}
