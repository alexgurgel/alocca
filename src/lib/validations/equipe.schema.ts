import { z } from "zod";

export const convidarUsuarioSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
});

export type ConvidarUsuarioInput = z.infer<typeof convidarUsuarioSchema>;
