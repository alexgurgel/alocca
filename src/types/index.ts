import type {
  Database,
  StatusCandidatura,
  StatusCheckin,
  StatusConvite,
  StatusEvento,
  StatusFuncionario,
} from "./database.types";

export type {
  StatusCheckin,
  StatusCandidatura,
  StatusConvite,
  StatusEvento,
  StatusFuncionario,
  PapelUsuario,
} from "./database.types";

export type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
export type Perfil = Database["public"]["Tables"]["perfis"]["Row"];
export type Funcionario = Database["public"]["Tables"]["funcionarios"]["Row"];
export type Funcao = Database["public"]["Tables"]["funcoes"]["Row"];
export type Evento = Database["public"]["Tables"]["eventos"]["Row"];
export type EventoFuncao = Database["public"]["Tables"]["evento_funcoes"]["Row"];
export type Convite = Database["public"]["Tables"]["convites"]["Row"];
export type CandidaturaEvento = Database["public"]["Tables"]["candidaturas_evento"]["Row"];
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

export interface CandidaturaEventoComRelacoes extends CandidaturaEvento {
  funcao: Funcao;
  funcionario?: Funcionario | null;
  convite?: Convite | null;
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

export const STATUS_CANDIDATURA_LABEL: Record<StatusCandidatura, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

export const STATUS_CHECKIN_LABEL: Record<StatusCheckin, string> = {
  pendente: "Pendente",
  presente: "Presente",
  ausente: "Ausente",
  atrasado: "Atrasado",
};

export const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
