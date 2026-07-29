import { z } from "zod";
import { nomeCompletoSchema } from "./nome";

export const colaboradorSchema = z.object({
  nome: nomeCompletoSchema,
  cpf: z.string().optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  data_nascimento: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  chave_pix: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo"]),
  funcao_ids: z.array(z.string()),
});

export type ColaboradorInput = z.infer<typeof colaboradorSchema>;
