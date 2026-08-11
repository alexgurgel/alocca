import { z } from "zod";
import { nomeCompletoSchema } from "./nome";
import { maiorDeIdade } from "./idade";

export const colaboradorSchema = z.object({
  nome: nomeCompletoSchema,
  cpf: z.string().optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  data_nascimento: z
    .string()
    .min(1, "Data de nascimento obrigatória")
    .refine(maiorDeIdade, "Não é permitido cadastrar menor de 18 anos"),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  chave_pix: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo"]),
  funcao_ids: z.array(z.string()),
});

export type ColaboradorInput = z.infer<typeof colaboradorSchema>;
