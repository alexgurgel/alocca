"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { finalizarEvento } from "@/services/eventos.service";
import { useFinalizacaoEvento } from "@/hooks/use-finalizacao-evento";
import type { Evento } from "@/types";

interface FinalizarEventoCardProps {
  evento: Evento;
  onAtualizado: (evento: Evento) => void;
  onIrParaCheckin: () => void;
}

export function FinalizarEventoCard({ evento, onAtualizado, onIrParaCheckin }: FinalizarEventoCardProps) {
  const [open, setOpen] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const { pendentes, carregando } = useFinalizacaoEvento(evento.id);

  const bloqueado = carregando || pendentes.length > 0;

  async function handleFinalizar() {
    setFinalizando(true);
    try {
      const supabase = createClient();
      const atualizado = await finalizarEvento(supabase, evento.id);
      onAtualizado(atualizado);
      toast.success("Evento finalizado.");
      setOpen(false);
    } catch {
      toast.error("Não foi possível finalizar o evento.");
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">O evento já passou do horário de término</h3>
            <p className="text-xs text-muted-foreground">
              {bloqueado
                ? "Registre a presença de todos os freelancers confirmados para liberar a finalização."
                : "Todos os freelancers confirmados já têm presença registrada. Você já pode finalizar o evento."}
            </p>
          </div>
        </div>
        <Button type="button" onClick={() => setOpen(true)} disabled={bloqueado}>
          Finalizar evento
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bloqueado ? "Ainda há pendências de presença" : "Finalizar evento?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bloqueado
                ? "Para finalizar o evento, é necessário registrar a presença ou ausência de todos os freelancers confirmados."
                : "O status do evento será alterado para Finalizado e o relatório financeiro ficará disponível."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            {bloqueado ? (
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  onIrParaCheckin();
                }}
              >
                Ir para lista de presença
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleFinalizar();
                }}
                disabled={finalizando}
              >
                {finalizando ? <Loader2 className="size-4 animate-spin" /> : null}
                Finalizar evento
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
