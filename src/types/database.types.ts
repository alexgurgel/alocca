/**
 * Tipos gerados manualmente a partir de supabase/migrations/*.sql.
 * Ao alterar o schema, atualize este arquivo (ou rode `supabase gen types typescript`
 * apontando para o projeto real e substitua o conteúdo).
 */

export type StatusFuncionario = "ativo" | "inativo";
export type StatusEvento = "planejado" | "em_andamento" | "finalizado" | "cancelado";
export type StatusConvite = "pendente" | "aceito" | "recusado";
export type StatusCandidatura = "pendente" | "aprovada" | "rejeitada";
export type StatusCheckin = "pendente" | "presente" | "ausente" | "atrasado";
export type PapelUsuario = "admin" | "colaborador";

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
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfis"]["Insert"]>;
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
          observacoes: string | null;
          status: StatusFuncionario;
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
          observacoes?: string | null;
          status?: StatusFuncionario;
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
          valor_diaria_padrao: number | null;
          observacoes: string | null;
          lista_publica_token: string;
          candidatura_publica_token: string;
          lista_publica_observacao_fornecedor: string | null;
          lista_publica_observacao_fornecedor_at: string | null;
          status: StatusEvento;
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
          valor_diaria_padrao?: number | null;
          observacoes?: string | null;
          lista_publica_token?: string;
          candidatura_publica_token?: string;
          lista_publica_observacao_fornecedor?: string | null;
          lista_publica_observacao_fornecedor_at?: string | null;
          status?: StatusEvento;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          evento_id: string;
          funcao_id: string;
          vagas?: number;
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
          valor_diaria?: number | null;
          observacoes?: string | null;
          enviado_em?: string;
          respondido_em?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["convites"]["Insert"]>;
        Relationships: Relationship[];
      };
      candidaturas_evento: {
        Row: {
          id: string;
          empresa_id: string;
          evento_id: string;
          funcao_id: string;
          funcionario_id: string | null;
          convite_id: string | null;
          nome: string;
          cpf: string | null;
          telefone: string | null;
          email: string | null;
          observacoes: string | null;
          data_nascimento: string | null;
          cidade: string | null;
          estado: string | null;
          lgpd_aceito: boolean;
          lgpd_aceito_em: string | null;
          email_confirmacao_enviado_em: string | null;
          email_confirmacao_destino: string | null;
          email_confirmacao_erro: string | null;
          status: StatusCandidatura;
          aprovada_em: string | null;
          rejeitada_em: string | null;
          avaliada_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          evento_id: string;
          funcao_id: string;
          funcionario_id?: string | null;
          convite_id?: string | null;
          nome: string;
          cpf?: string | null;
          telefone?: string | null;
          email?: string | null;
          observacoes?: string | null;
          data_nascimento?: string | null;
          cidade?: string | null;
          estado?: string | null;
          lgpd_aceito?: boolean;
          lgpd_aceito_em?: string | null;
          email_confirmacao_enviado_em?: string | null;
          email_confirmacao_destino?: string | null;
          email_confirmacao_erro?: string | null;
          status?: StatusCandidatura;
          aprovada_em?: string | null;
          rejeitada_em?: string | null;
          avaliada_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["candidaturas_evento"]["Insert"]>;
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
        };
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
      obter_lista_publica_evento: {
        Args: { p_token: string };
        Returns: {
          evento_id: string;
          evento_nome: string;
          evento_status: StatusEvento;
          evento_cliente: string | null;
          evento_local: string | null;
          evento_endereco: string | null;
          evento_data_inicio: string;
          evento_data_fim: string;
          evento_observacoes: string | null;
          lista_publica_token: string;
          lista_publica_observacao_fornecedor: string | null;
          lista_publica_observacao_fornecedor_at: string | null;
          funcao_id: string | null;
          funcao_nome: string | null;
          vagas: number | null;
          convite_id: string | null;
          convite_status: StatusConvite | null;
          funcionario_nome: string | null;
          valor_diaria: number | null;
          convite_observacoes: string | null;
          respondido_em: string | null;
        }[];
      };
      obter_evento_candidatura_publica: {
        Args: { p_token: string };
        Returns: {
          evento_id: string;
          evento_nome: string;
          evento_status: StatusEvento;
          evento_cliente: string | null;
          evento_local: string | null;
          evento_endereco: string | null;
          evento_data_inicio: string;
          evento_data_fim: string;
          evento_observacoes: string | null;
          candidatura_publica_token: string;
          funcao_id: string;
          funcao_nome: string;
          vagas: number;
          confirmados: number;
          pendentes: number;
        }[];
      };
      atualizar_observacao_publica_evento: {
        Args: { p_token: string; p_observacao: string | null };
        Returns: undefined;
      };
      criar_candidatura_publica: {
        Args: {
          p_token: string;
          p_funcao_id: string;
          p_nome: string;
          p_cpf: string;
          p_telefone: string;
          p_email: string;
          p_data_nascimento: string;
          p_cidade: string;
          p_estado: string;
          p_lgpd_aceito: boolean;
          p_observacoes?: string | null;
        };
        Returns: string;
      };
      buscar_cadastro_publico_evento: {
        Args: {
          p_token: string;
          p_cpf: string;
          p_email?: string | null;
          p_telefone?: string | null;
        };
        Returns: {
          funcionario_id: string | null;
          nome: string | null;
          cpf: string | null;
          telefone: string | null;
          email: string | null;
          data_nascimento: string | null;
          cidade: string | null;
          estado: string | null;
          observacoes: string | null;
          ja_cadastrado_evento: boolean;
          candidatura_status: StatusCandidatura | null;
        }[];
      };
      aprovar_candidatura_evento: {
        Args: { p_candidatura_id: string };
        Returns: string;
      };
      rejeitar_candidatura_evento: {
        Args: { p_candidatura_id: string };
        Returns: undefined;
      };
      responder_convite_publico: {
        Args: { p_id: string; p_status: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
