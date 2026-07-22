import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  pagina: number;
  porPagina: number;
  total: number;
  onChange: (pagina: number) => void;
}

export function PaginationBar({ pagina, porPagina, total, onChange }: PaginationBarProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-1 py-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? "Nenhum resultado" : `Mostrando ${inicio}–${fim} de ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => onChange(pagina - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <span className="min-w-16 text-center text-sm text-muted-foreground">
          {pagina} / {totalPaginas}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => onChange(pagina + 1)}
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
