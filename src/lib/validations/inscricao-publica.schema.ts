import { z } from "zod";
import { isCpfValido } from "@/lib/cpf";

export const cpfLookupSchema = z.object({
  cpf: z.string().refine(isCpfValido, "CPF inválido"),
});

export type CpfLookupInput = z.infer<typeof cpfLookupSchema>;

export const inscricaoPublicaSchema = z.object({
  funcao_id: z.string().min(1, "Selecione uma função"),
  nome: z.string().min(2, "Informe o nome completo"),
  telefone: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  data_nascimento: z.string().min(1, "Informe a data de nascimento"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().min(2, "Selecione o estado"),
  observacoes: z.string().optional().or(z.literal("")),
});

export type InscricaoPublicaInput = z.infer<typeof inscricaoPublicaSchema>;
