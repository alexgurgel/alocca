import { z } from "zod";

export const eventoSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome do evento"),
    cliente: z.string().optional().or(z.literal("")),
    local: z.string().optional().or(z.literal("")),
    endereco: z.string().optional().or(z.literal("")),
    data_inicio: z.string().min(1, "Informe a data/hora inicial"),
    data_fim: z.string().min(1, "Informe a data/hora final"),
    valor_diaria_padrao: z.string().optional().or(z.literal("")),
    observacoes: z.string().optional().or(z.literal("")),
    status: z.enum(["planejado", "em_andamento", "finalizado", "cancelado"]),
  })
  .refine((data) => new Date(data.data_fim) >= new Date(data.data_inicio), {
    message: "A data final deve ser igual ou posterior à data inicial",
    path: ["data_fim"],
  });

export type EventoInput = z.infer<typeof eventoSchema>;
