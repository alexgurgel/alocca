import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field";
import type { FieldError as FieldErrorType } from "react-hook-form";

export const LGPD_MENSAGEM =
  "Seus dados pessoais serão usados exclusivamente para viabilizar sua participação em eventos cadastrados na Alocca (identificação, contato e formalização de escalas), em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Você pode solicitar a atualização ou exclusão dos seus dados a qualquer momento.";

export function LgpdConsentField({
  id,
  checked,
  onCheckedChange,
  error,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: FieldErrorType;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="group/field flex items-start gap-2.5 text-sm">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-0.5"
          aria-invalid={!!error}
        />
        <span className="text-muted-foreground">
          Li e aceito a forma como meus dados serão utilizados, conforme a LGPD.{" "}
          <span className="text-xs">{LGPD_MENSAGEM}</span>
        </span>
      </label>
      <FieldError errors={[error]} />
    </div>
  );
}
