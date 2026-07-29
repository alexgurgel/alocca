"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAppContext } from "@/components/providers/app-provider";
import { useFuncoes } from "@/hooks/use-funcoes";
import { PageHeader } from "@/components/shared/page-header";
import { ColaboradorForm } from "@/components/colaboradores/colaborador-form";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { getFuncionario } from "@/services/funcionarios.service";
import type { FuncionarioComFuncoes } from "@/types";
import { UserX } from "lucide-react";

export default function EditarColaboradorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { perfil } = useAppContext();
  const { funcoes } = useFuncoes(perfil.empresa_id ?? undefined);

  const [colaborador, setColaborador] = useState<FuncionarioComFuncoes | null | undefined>(
    undefined
  );

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();
    getFuncionario(supabase, params.id).then((dados) => {
      if (ativo) setColaborador(dados);
    });
    return () => {
      ativo = false;
    };
  }, [params.id]);

  if (colaborador === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (colaborador === null) {
    return (
      <EmptyState
        icon={UserX}
        title="Freelancer não encontrado"
        description="Ele pode ter sido removido."
        action={
          <button
            onClick={() => router.push("/colaboradores")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Voltar para freelancers
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={colaborador.nome} description="Edite os dados do freelancer." />
      <div className="mx-auto max-w-3xl">
        <ColaboradorForm
          empresaId={perfil.empresa_id ?? ""}
          funcoes={funcoes}
          colaborador={colaborador}
        />
      </div>
    </div>
  );
}
