"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/format";

interface FotoUploadProps {
  nome: string;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
}

export function FotoUpload({ nome, previewUrl, onChange }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <div className="group relative">
        <Avatar className="size-20 border border-border">
          <AvatarImage src={previewUrl ?? undefined} alt={nome} />
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {getInitials(nome) || "?"}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Camera className="size-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Camera />
          {previewUrl ? "Trocar foto" : "Adicionar foto"}
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => onChange(null)}
          >
            <X />
            Remover
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          onChange(file ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
