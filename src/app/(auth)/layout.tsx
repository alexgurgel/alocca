import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { CalendarCheck2, ClipboardCheck, Users2 } from "lucide-react";

const DESTAQUES = [
  {
    icon: Users2,
    titulo: "Equipe sempre organizada",
    descricao: "Cadastre colaboradores, funções e monte escalas em minutos.",
  },
  {
    icon: CalendarCheck2,
    titulo: "Eventos sob controle",
    descricao: "Acompanhe convites, confirmações e recusas em tempo real.",
  },
  {
    icon: ClipboardCheck,
    titulo: "Check-in no dia do evento",
    descricao: "Saiba exatamente quem está presente, ausente ou atrasado.",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)",
          }}
        />
        <div className="relative z-10">
          <Logo variant="mono" tagline />
        </div>
        <div className="relative z-10 space-y-10">
          <h1 className="text-3xl font-semibold leading-tight text-balance">
            A operação da sua produtora, organizada do início ao fim.
          </h1>
          <div className="space-y-6">
            {DESTAQUES.map((item) => (
              <div key={item.titulo} className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{item.titulo}</p>
                  <p className="text-sm text-white/75">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} Alocca. Gestão operacional para produtores de eventos.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
