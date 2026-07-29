"use client";

import { useEffect, useState } from "react";
import { MailX } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConviteCard } from "@/components/colaborador-portal/convite-card";
import { createClient } from "@/lib/supabase/client";
import { listConvitesDoColaborador } from "@/services/convites.service";
import type { ConviteComRelacoes } from "@/types";

export default function MeusConvitesPage() {
  const { perfil } = useAppContext();
  const [convites, setConvites] = useState<ConviteComRelacoes[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!perfil.funcionario_id) {
      setCarregando(false);
      return;
    }
    const supabase = createClient();
    listConvitesDoColaborador(supabase, perfil.funcionario_id)
      .then(setConvites)
      .finally(() => setCarregando(false));
  }, [perfil.funcionario_id]);

  return (
    <div className="space-y-6">
      <PageHeader title="Meus convites" description="Acompanhe os eventos para os quais você foi convocado." />

      {carregando ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : !perfil.funcionario_id ? (
        <EmptyState
          icon={MailX}
          title="Sua conta ainda não está vinculada a um freelancer"
          description="Fale com o produtor responsável para vincular seu acesso."
        />
      ) : convites.length === 0 ? (
        <EmptyState icon={MailX} title="Nenhum convite recebido ainda" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {convites.map((convite) => (
            <ConviteCard key={convite.id} convite={convite} />
          ))}
        </div>
      )}
    </div>
  );
}
