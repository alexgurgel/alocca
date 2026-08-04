import type {
  Database,
  PlanoAcesso,
  StatusCheckin,
  StatusConta,
  StatusConvite,
  StatusEvento,
  StatusFuncionario,
} from "./database.types";

export type {
  OrigemConvite,
  StatusCheckin,
  StatusConvite,
  StatusEvento,
  StatusFuncionario,
  PapelUsuario,
  PlanoAcesso,
  StatusConta,
} from "./database.types";

export type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
export type Perfil = Database["public"]["Tables"]["perfis"]["Row"];
export type Funcionario = Database["public"]["Tables"]["funcionarios"]["Row"];
export type Funcao = Database["public"]["Tables"]["funcoes"]["Row"];
export type Evento = Database["public"]["Tables"]["eventos"]["Row"];
export type EventoFuncao = Database["public"]["Tables"]["evento_funcoes"]["Row"];
export type Convite = Database["public"]["Tables"]["convites"]["Row"];
export type Checkin = Database["public"]["Tables"]["checkins"]["Row"];

export interface FuncionarioComFuncoes extends Funcionario {
  funcoes: Funcao[];
}

export interface ConviteComRelacoes extends Convite {
  funcionario: Funcionario;
  funcao: Funcao;
  evento?: Evento;
}

export interface EscalaFuncao extends EventoFuncao {
  funcao: Funcao;
  convites: ConviteComRelacoes[];
}

export interface CheckinComRelacoes extends Checkin {
  funcionario: Funcionario;
}

export const STATUS_FUNCIONARIO_LABEL: Record<StatusFuncionario, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export const STATUS_EVENTO_LABEL: Record<StatusEvento, string> = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const STATUS_CONVITE_LABEL: Record<StatusConvite, string> = {
  pendente: "Pendente",
  aceito: "Aceito",
  recusado: "Recusado",
};

export const STATUS_CHECKIN_LABEL: Record<StatusCheckin, string> = {
  pendente: "Pendente",
  presente: "Presente",
  ausente: "Ausente",
  atrasado: "Atrasado",
};

export const PLANO_LABEL: Record<PlanoAcesso, string> = {
  free: "Free",
  intermediario: "Intermediário",
  master: "Master",
  admin: "Admin",
};

export const STATUS_CONTA_LABEL: Record<StatusConta, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

// Free: eventos, freelancers, escalas, check-in, configurações, link público
// de candidatura e a lista pública de confirmados (ativar/copiar link) — o
// básico pra rodar a operação. Só a exportação em PDF/Excel da lista pública
// (checada no banco, na RPC lista_publica_evento_info) e as duas telas
// abaixo exigem plano pago:
export const PLANOS_COM_FINANCEIRO: PlanoAcesso[] = ["master", "admin"];
export const PLANOS_COM_RELATORIOS: PlanoAcesso[] = ["master", "admin"];

export const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
