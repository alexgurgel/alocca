import { z } from "zod";

export const candidaturaPublicaSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome completo"),
    cpf: z
      .string()
      .min(14, "Informe o CPF completo")
      .refine((value) => value.replace(/\D/g, "").length === 11, "CPF invalido"),
    telefone: z
      .string()
      .min(14, "Informe o telefone completo")
      .refine((value) => value.replace(/\D/g, "").length >= 10, "Telefone invalido"),
    email: z.string().email("E-mail invalido"),
    data_nascimento: z.string().min(1, "Informe a data de nascimento"),
    cidade: z.string().min(2, "Informe a cidade"),
    estado: z.string().length(2, "Selecione o estado"),
    funcao_id: z.string().min(1, "Selecione a funcao desejada"),
    observacoes: z.string().optional().or(z.literal("")),
    lgpd_aceito: z.boolean(),
  })
  .refine((values) => values.data_nascimento <= new Date().toISOString().slice(0, 10), {
    message: "Data de nascimento invalida",
    path: ["data_nascimento"],
  })
  .refine((values) => values.lgpd_aceito, {
    message: "Voce precisa aceitar o termo de LGPD",
    path: ["lgpd_aceito"],
  });

export type CandidaturaPublicaInput = z.infer<typeof candidaturaPublicaSchema>;
