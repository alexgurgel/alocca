"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { sair } from "@/services/auth.service";
import type { Perfil } from "@/types";
import { cn } from "@/lib/utils";

export function UserMenu({
  perfil,
  dark = false,
  minimal = false,
}: {
  perfil: Perfil;
  dark?: boolean;
  minimal?: boolean;
}) {
  const router = useRouter();

  async function handleSair() {
    try {
      const supabase = createClient();
      await sair(supabase);
      router.push("/entrar");
      router.refresh();
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors",
              dark ? "hover:bg-white/5" : "hover:bg-accent"
            )}
          />
        }
      >
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={perfil.avatar_url ?? undefined} alt={perfil.nome} />
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {getInitials(perfil.nome)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              dark ? "text-white" : "text-foreground"
            )}
          >
            {perfil.nome}
          </p>
          <p className={cn("truncate text-xs", dark ? "text-white/50" : "text-muted-foreground")}>
            {perfil.email}
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{perfil.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!minimal ? (
          <>
            <DropdownMenuItem render={<Link href="/perfil" />}>
              <User />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/configuracoes" />}>
              <Settings />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem variant="destructive" onClick={handleSair}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
