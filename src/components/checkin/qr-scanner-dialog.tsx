"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { CameraOff, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { checkinPorQrToken } from "@/services/checkins.service";
import { createClient } from "@/lib/supabase/client";
import { STATUS_CHECKIN_LABEL } from "@/types";

interface QrScannerDialogProps {
  eventoId: string;
  eventoDataInicio: string;
  onCheckin?: () => void;
}

export function QrScannerDialog({ eventoId, eventoDataInicio, onCheckin }: QrScannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [erroCamera, setErroCamera] = useState(false);
  const [carregandoCamera, setCarregandoCamera] = useState(true);
  const [processando, setProcessando] = useState(false);
  // Estado (nao useRef) porque o <video> so existe no DOM depois que o
  // Dialog termina de montar/animar — um useRef comum podia ficar nulo
  // no momento em que o efeito abaixo rodava, fazendo o scanner nunca
  // ser iniciado (e o navegador nunca pedir permissao de camera).
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const processandoRef = useRef(false);

  const handleResultado = useCallback(
    async (qrToken: string) => {
      if (processandoRef.current) return;
      processandoRef.current = true;
      setProcessando(true);

      try {
        const supabase = createClient();
        const resultado = await checkinPorQrToken(supabase, eventoId, qrToken, eventoDataInicio);

        if (!resultado) {
          toast.error("QR code inválido para este evento.");
        } else if (resultado.jaConfirmado) {
          toast.info(`${resultado.nome} já estava marcado como ${STATUS_CHECKIN_LABEL[resultado.status]}.`);
        } else {
          toast.success(`${resultado.nome} — check-in registrado como ${STATUS_CHECKIN_LABEL[resultado.status]}.`);
          onCheckin?.();
        }
      } catch {
        toast.error("Não foi possível processar o QR code. Tente novamente.");
      } finally {
        setProcessando(false);
        processandoRef.current = false;
      }
    },
    [eventoId, eventoDataInicio, onCheckin]
  );

  useEffect(() => {
    if (!open || !videoEl) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setErroCamera(true);
      setCarregandoCamera(false);
      return;
    }

    const scanner = new QrScanner(
      videoEl,
      (result) => handleResultado(result.data),
      { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 5 }
    );
    scannerRef.current = scanner;
    setErroCamera(false);
    setCarregandoCamera(true);

    scanner
      .start()
      .then(() => setCarregandoCamera(false))
      .catch(() => {
        setErroCamera(true);
        setCarregandoCamera(false);
      });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [open, videoEl, handleResultado]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <ScanLine />
        Escanear QR code
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear QR code de check-in</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Aponte a câmera para o QR code que o freelancer recebeu por e-mail ao ser confirmado.
          </p>

          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
            <video ref={setVideoEl} className="size-full object-cover" muted playsInline />

            {carregandoCamera && !erroCamera ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/90 p-4 text-center text-sm text-white">
                <Loader2 className="size-6 animate-spin" />
                Aguardando permissão da câmera — se o navegador mostrou um aviso pedindo acesso, clique em &quot;Permitir&quot;.
              </div>
            ) : null}

            {erroCamera ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/90 p-4 text-center text-sm text-white">
                <CameraOff className="size-6" />
                <p>Não foi possível acessar a câmera.</p>
                <p className="text-xs text-white/70">
                  Se você negou o acesso antes, clique no ícone de cadeado/câmera na barra de endereço do
                  navegador e permita a câmera para este site, depois feche e abra este scanner de novo.
                </p>
              </div>
            ) : null}

            {processando ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="size-6 animate-spin text-white" />
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
