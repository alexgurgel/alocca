import { z } from "zod";

export const escalaFuncaoSchema = z.object({
  funcao_id: z.string().min(1, "Selecione uma função"),
  vagas: z
    .number({ error: "Informe a quantidade de vagas" })
    .int({ error: "Informe a quantidade de vagas" })
    .min(1, "Informe ao menos 1 vaga"),
  valor_diaria: z
    .string()
    .min(1, "Informe o valor da diária")
    .refine((v) => Number(v) > 0, "Informe um valor válido"),
});

export type EscalaFuncaoInput = z.infer<typeof escalaFuncaoSchema>;

export const convidarColaboradorSchema = z.object({
  funcionario_ids: z.array(z.string()).min(1, "Selecione ao menos um freelancer"),
  valor_diaria: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

export type ConvidarColaboradorInput = z.infer<typeof convidarColaboradorSchema>;
