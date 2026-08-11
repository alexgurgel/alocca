import { z } from "zod";
import { nomeCompletoSchema } from "./nome";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const cadastroSchema = z
  .object({
    nomeEmpresa: z.string().min(2, "Informe o nome da sua empresa"),
    nome: nomeCompletoSchema,
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
    aceiteLgpd: z.boolean().refine((v) => v === true, {
      message: "É necessário aceitar os termos de privacidade para continuar.",
    }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;

export const aceitarConviteEquipeSchema = z
  .object({
    nome: nomeCompletoSchema,
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type AceitarConviteEquipeInput = z.infer<typeof aceitarConviteEquipeSchema>;

export const esqueciSenhaSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
});

export type EsqueciSenhaInput = z.infer<typeof esqueciSenhaSchema>;

export const redefinirSenhaSchema = z
  .object({
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
