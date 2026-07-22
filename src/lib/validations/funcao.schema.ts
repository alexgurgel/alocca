import { z } from "zod";

export const funcaoSchema = z.object({
  nome: z.string().min(2, "Informe o nome da função"),
  descricao: z.string().optional().or(z.literal("")),
  cor: z.string().optional().or(z.literal("")),
});

export type FuncaoInput = z.infer<typeof funcaoSchema>;
