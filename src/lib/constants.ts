import type { StatusCheckin, StatusConta, StatusConvite, StatusEvento, StatusFuncionario } from "@/types";

export const APP_NAME = "Alocca";

type BadgeTone = "blue" | "purple" | "cyan" | "green" | "amber" | "red" | "gray";

export const STATUS_FUNCIONARIO_TONE: Record<StatusFuncionario, BadgeTone> = {
  ativo: "green",
  inativo: "gray",
};

export const STATUS_EVENTO_TONE: Record<StatusEvento, BadgeTone> = {
  planejado: "blue",
  em_andamento: "amber",
  finalizado: "green",
  cancelado: "red",
};

export const STATUS_CONVITE_TONE: Record<StatusConvite, BadgeTone> = {
  pendente: "amber",
  aceito: "green",
  recusado: "red",
};

export const STATUS_CHECKIN_TONE: Record<StatusCheckin, BadgeTone> = {
  pendente: "gray",
  presente: "green",
  ausente: "red",
  atrasado: "amber",
};

export const STATUS_CONTA_TONE: Record<StatusConta, BadgeTone> = {
  pendente: "amber",
  aprovado: "green",
  recusado: "red",
};

export const TONE_BG_SOLID: Record<BadgeTone, string> = {
  blue: "bg-blue-500",
  purple: "bg-violet-500",
  cyan: "bg-cyan-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-slate-400",
};

export const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
  purple:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20",
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
  gray: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20",
};

export const NAV_ITEMS = [
  { label: "Painel", href: "/painel", icon: "LayoutDashboard" },
  { label: "Eventos", href: "/eventos", icon: "CalendarDays" },
  { label: "Freelancers", href: "/colaboradores", icon: "Users" },
  { label: "Funções", href: "/funcoes", icon: "Tags" },
  { label: "Escalas", href: "/escalas", icon: "ClipboardList" },
  { label: "Check-in", href: "/checkin", icon: "QrCode" },
  { label: "Relatórios", href: "/relatorios", icon: "BarChart3" },
  { label: "Configurações", href: "/configuracoes", icon: "Settings" },
  { label: "Aprovações", href: "/aprovacoes", icon: "ShieldCheck", adminPlataformaOnly: true },
] as const;
