/**
 * Tipos gerados manualmente a partir de supabase/migrations/*.sql.
 * Ao alterar o schema, atualize este arquivo (ou rode `supabase gen types typescript`
 * apontando para o projeto real e substitua o conteúdo).
 */

export type StatusFuncionario = "ativo" | "inativo";
export type StatusEvento = "planejado" | "em_andamento" | "finalizado" | "cancelado";
export type StatusConvite = "pendente" | "aceito" | "recusado";
export type OrigemConvite = "convite" | "candidatura";
export type StatusCheckin = "pendente" | "presente" | "ausente" | "atrasado";
export type PapelUsuario = "admin" | "colaborador";
export type PlanoAcesso = "free" | "intermediario" | "master" | "admin";
export type StatusConta = "pendente" | "aprovado" | "recusado";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          cnpj: string | null;
          telefone: string | null;
          email: string | null;
          endereco: string | null;
          logo_url: string | null;
          limite_usuarios: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          nome: string;
          cnpj?: string | null;
          telefone?: string | null;
          email?: string | null;
          endereco?: string | null;
          logo_url?: string | null;
          limite_usuarios?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["empresas"]["Insert"]>;
        Relationships: Relationship[];
      };
      perfis: {
        Row: {
          id: string;
          empresa_id: string | null;
          funcionario_id: string | null;
          nome: string;
          email: string;
          avatar_url: string | null;
          telefone: string | null;
          papel: PapelUsuario;
          consentimento_lgpd_em: string | null;
          plano: PlanoAcesso;
          status_conta: StatusConta;
          aprovado_por: string | null;
          aprovado_em: string | null;
          ativo: boolean;
          data_vencimento: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          empresa_id?: string | null;
          funcionario_id?: string | null;
          nome: string;
          email: string;
          avatar_url?: string | null;
          telefone?: string | null;
          papel?: PapelUsuario;
          consentimento_lgpd_em?: string | null;
          plano?: PlanoAcesso;
          status_conta?: StatusConta;
          aprovado_por?: string | null;
          aprovado_em?: string | null;
          ativo?: boolean;
          data_vencimento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfis"]["Insert"]>;
        Relationships: Relationship[];
      };
      convites_equipe: {
        Row: {
          id: string;
          empresa_id: string;
          email: string;
          criado_por: string;
          usado_em: string | null;
          expira_em: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          email: string;
          criado_por: string;
          usado_em?: string | null;
          expira_em?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["convites_equipe"]["Insert"]>;
        Relationships: Relationship[];
      };
      funcionarios: {
        Row: {
          id: string;
          empresa_id: string;
          user_id: string | null;
          nome: string;
          cpf: string | null;
          telefone: string | null;
          email: string | null;
          data_nascimento: string | null;
          cidade: string | null;
          estado: string | null;
          foto_url: string | null;
          chave_pix: string | null;
          observacoes: string | null;
          status: StatusFuncionario;
          consentimento_lgpd_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          user_id?: string | null;
          nome: string;
          cpf?: string | null;
          telefone?: string | null;
          email?: string | null;
          data_nascimento?: string | null;
          cidade?: string | null;
          estado?: string | null;
          foto_url?: string | null;
          chave_pix?: string | null;
          observacoes?: string | null;
          status?: StatusFuncionario;
          consentimento_lgpd_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["funcionarios"]["Insert"]>;
        Relationships: Relationship[];
      };
      funcoes: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          descricao: string | null;
          cor: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          nome: string;
          descricao?: string | null;
          cor?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["funcoes"]["Insert"]>;
        Relationships: Relationship[];
      };
      funcionario_funcoes: {
        Row: {
          funcionario_id: string;
          funcao_id: string;
          created_at: string;
        };
        Insert: {
          funcionario_id: string;
          funcao_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["funcionario_funcoes"]["Insert"]>;
        Relationships: Relationship[];
      };
      eventos: {
        Row: {
          id: string;
          empresa_id: string;
          criado_por: string | null;
          nome: string;
          cliente: string | null;
          local: string | null;
          endereco: string | null;
          data_inicio: string;
          data_fim: string;
          observacoes: string | null;
          status: StatusEvento;
          inscricao_publica_ativa: boolean;
          lista_publica_ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          criado_por?: string | null;
          nome: string;
          cliente?: string | null;
          local?: string | null;
          endereco?: string | null;
          data_inicio: string;
          data_fim: string;
          observacoes?: string | null;
          status?: StatusEvento;
          inscricao_publica_ativa?: boolean;
          lista_publica_ativa?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["eventos"]["Insert"]>;
        Relationships: Relationship[];
      };
      evento_funcoes: {
        Row: {
          id: string;
          evento_id: string;
          funcao_id: string;
          vagas: number;
          valor_diaria: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          evento_id: string;
          funcao_id: string;
          vagas?: number;
          valor_diaria?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["evento_funcoes"]["Insert"]>;
        Relationships: Relationship[];
      };
      convites: {
        Row: {
          id: string;
          evento_id: string;
          funcionario_id: string;
          funcao_id: string;
          status: StatusConvite;
          origem: OrigemConvite;
          valor_diaria: number | null;
          observacoes: string | null;
          enviado_em: string;
          respondido_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          evento_id: string;
          funcionario_id: string;
          funcao_id: string;
          status?: StatusConvite;
          origem?: OrigemConvite;
          valor_diaria?: number | null;
          observacoes?: string | null;
          enviado_em?: string;
          respondido_em?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["convites"]["Insert"]>;
        Relationships: Relationship[];
      };
      checkins: {
        Row: {
          id: string;
          evento_id: string;
          funcionario_id: string;
          convite_id: string | null;
          status: StatusCheckin;
          hora_checkin: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          evento_id: string;
          funcionario_id: string;
          convite_id?: string | null;
          status?: StatusCheckin;
          hora_checkin?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["checkins"]["Insert"]>;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      criar_empresa_e_perfil: {
        Args: {
          p_nome_empresa: string;
          p_nome_usuario: string;
          p_email: string;
          p_aceite_lgpd: boolean;
        };
        Returns: Database["public"]["Tables"]["perfis"]["Row"];
      };
      criar_convite_equipe: {
        Args: { p_email: string };
        Returns: Database["public"]["Tables"]["convites_equipe"]["Row"];
      };
      obter_convite_equipe: {
        Args: { p_token: string };
        Returns: { email: string; empresa_nome: string }[];
      };
      aceitar_convite_equipe: {
        Args: { p_token: string; p_nome: string };
        Returns: Database["public"]["Tables"]["perfis"]["Row"];
      };
      current_empresa_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_funcionario_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      obter_convite_publico: {
        Args: { p_id: string };
        Returns: {
          id: string;
          status: StatusConvite;
          valor_diaria: number | null;
          observacoes: string | null;
          funcao_nome: string;
          evento_nome: string;
          evento_local: string | null;
          evento_endereco: string | null;
          evento_data_inicio: string;
          evento_data_fim: string;
          evento_observacoes: string | null;
        }[];
      };
      responder_convite_publico: {
        Args: { p_id: string; p_status: string };
        Returns: undefined;
      };
      cpf_valido: {
        Args: { p_cpf: string };
        Returns: boolean;
      };
      evento_publico: {
        Args: { p_evento_id: string };
        Returns: {
          id: string;
          nome: string;
          local: string | null;
          endereco: string | null;
          data_inicio: string;
          data_fim: string;
          observacoes: string | null;
          empresa_nome: string;
        }[];
      };
      funcoes_disponiveis_evento: {
        Args: { p_evento_id: string };
        Returns: {
          funcao_id: string;
          nome: string;
          vagas_disponiveis: number;
        }[];
      };
      buscar_funcionario_por_cpf: {
        Args: { p_evento_id: string; p_cpf: string };
        Returns: {
          nome: string;
          telefone: string | null;
          email: string | null;
          data_nascimento: string | null;
          cidade: string | null;
          estado: string | null;
          chave_pix: string | null;
          observacoes: string | null;
        }[];
      };
      inscricao_publica_evento: {
        Args: {
          p_evento_id: string;
          p_funcao_id: string;
          p_nome: string;
          p_cpf: string;
          p_telefone: string;
          p_email: string;
          p_data_nascimento: string;
          p_cidade: string;
          p_estado: string;
          p_chave_pix: string;
          p_observacoes: string | null;
          p_aceite_lgpd: boolean;
        };
        Returns: string;
      };
      avancar_status_evento: {
        Args: { p_evento_id: string };
        Returns: Database["public"]["Tables"]["eventos"]["Row"];
      };
      lista_publica_evento_info: {
        Args: { p_evento_id: string };
        Returns: {
          id: string;
          nome: string;
          local: string | null;
          data_inicio: string;
          data_fim: string;
          status: string;
          empresa_nome: string;
          exportacao_liberada: boolean;
        }[];
      };
      lista_confirmados_evento: {
        Args: { p_evento_id: string };
        Returns: {
          funcionario_id: string;
          nome: string;
          funcao_nome: string;
          cpf: string | null;
          data_nascimento: string | null;
          telefone: string | null;
          email: string | null;
          chave_pix: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
