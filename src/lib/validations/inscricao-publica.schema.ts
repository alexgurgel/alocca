import { z } from "zod";
import { isCpfValido } from "@/lib/cpf";
import { nomeCompletoSchema } from "./nome";
import { maiorDeIdade } from "./idade";

export const cpfLookupSchema = z.object({
  cpf: z.string().refine(isCpfValido, "CPF inválido"),
});

export type CpfLookupInput = z.infer<typeof cpfLookupSchema>;

export const inscricaoPublicaSchema = z.object({
  funcao_id: z.string().min(1, "Selecione uma função"),
  nome: nomeCompletoSchema,
  telefone: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  data_nascimento: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine(maiorDeIdade, "Não é permitido cadastro de menor de idade"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().min(2, "Selecione o estado"),
  chave_pix: z.string().min(1, "Informe sua chave PIX"),
  observacoes: z.string().optional().or(z.literal("")),
  aceiteLgpd: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar os termos de privacidade para continuar.",
  }),
});

export type InscricaoPublicaInput = z.infer<typeof inscricaoPublicaSchema>;
