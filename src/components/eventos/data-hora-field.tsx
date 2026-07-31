"use client";

import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export function parseDataDoValor(value: string): Date | undefined {
  if (!value) return undefined;
  const data = parse(value.split("T")[0] ?? "", "yyyy-MM-dd", new Date());
  return isValid(data) ? data : undefined;
}

function parseValue(value: string) {
  const [, horaParte] = value.split("T");
  return { data: parseDataDoValor(value), hora: horaParte ?? "" };
}

function montarValor(data: Date | undefined, hora: string) {
  if (!data) return "";
  const dataStr = format(data, "yyyy-MM-dd");
  const horaStr = /^\d{2}:\d{2}$/.test(hora) ? hora : "00:00";
  return `${dataStr}T${horaStr}`;
}

interface DataHoraFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  disabled?: boolean;
}

export function DataHoraField({ id, value, onChange, minDate, disabled }: DataHoraFieldProps) {
  const [open, setOpen] = useState(false);
  const { data, hora } = parseValue(value);

  function handleSelecionarData(novaData: Date | undefined) {
    onChange(montarValor(novaData, hora || "00:00"));
    setOpen(false);
  }

  function handleHoraChange(input: string) {
    const digits = input.replace(/\D/g, "").slice(0, 4);
    const formatado = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
    onChange(montarValor(data, formatado));
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn("flex-1 justify-start font-normal", !data && "text-muted-foreground")}
            />
          }
        >
          <CalendarIcon className="size-4 shrink-0" />
          {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "dd/mm/aaaa"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={data}
            defaultMonth={data}
            onSelect={handleSelecionarData}
            disabled={minDate ? { before: minDate } : undefined}
          />
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        value={hora}
        onChange={(e) => handleHoraChange(e.target.value)}
        placeholder="HH:mm"
        inputMode="numeric"
        className="w-24 shrink-0"
        disabled={disabled}
      />
    </div>
  );
}
