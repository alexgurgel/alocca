import { z } from "zod";

const eventoBaseSchema = z.object({
  nome: z.string().min(2, "Informe o nome do evento"),
  cliente: z.string().optional().or(z.literal("")),
  local: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  data_inicio: z.string().min(1, "Informe a data/hora inicial"),
  data_fim: z.string().min(1, "Informe a data/hora final"),
  observacoes: z.string().optional().or(z.literal("")),
  status: z.enum(["planejado", "em_andamento", "finalizado", "cancelado"]),
});

export const eventoSchema = eventoBaseSchema.refine(
  (data) => new Date(data.data_fim) > new Date(data.data_inicio),
  {
    message: "A data final deve ser posterior à data inicial",
    path: ["data_fim"],
  }
);

export const novoEventoSchema = eventoBaseSchema
  .refine((data) => new Date(data.data_inicio) >= new Date(new Date().setSeconds(0, 0)), {
    message: "A data inicial não pode ser no passado",
    path: ["data_inicio"],
  })
  .refine((data) => new Date(data.data_fim) > new Date(data.data_inicio), {
    message: "A data final deve ser posterior à data inicial",
    path: ["data_fim"],
  });

export type EventoInput = z.infer<typeof eventoSchema>;
