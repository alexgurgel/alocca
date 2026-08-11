"use client";

import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DataFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  minDate?: Date;
  disabled?: boolean;
  placeholder?: string;
}

export function DataField({ value, onChange, minDate, disabled, placeholder = "Sem vencimento" }: DataFieldProps) {
  const [open, setOpen] = useState(false);
  const data = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const dataValida = data && isValid(data) ? data : undefined;

  function handleSelecionar(novaData: Date | undefined) {
    onChange(novaData ? format(novaData, "yyyy-MM-dd") : null);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className={cn("justify-start font-normal", !dataValida && "text-muted-foreground")}
            />
          }
        >
          <CalendarIcon className="size-3.5 shrink-0" />
          {dataValida ? format(dataValida, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={dataValida}
            defaultMonth={dataValida}
            onSelect={handleSelecionar}
            disabled={minDate ? { before: minDate } : undefined}
          />
        </PopoverContent>
      </Popover>
      {dataValida && !disabled ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)}>
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
