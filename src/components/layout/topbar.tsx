"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import type { Perfil } from "@/types";

export function Topbar({ perfil }: { perfil: Perfil }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
      <Link href="/painel">
        <Logo />
      </Link>

      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            className="w-72 border-none bg-[#0d1321] p-0 text-white [&>button]:text-white/70"
          >
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <div className="flex h-16 items-center px-5">
              <Logo variant="dark" />
            </div>
            <div className="flex-1 px-3 py-2">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
              <UserMenu perfil={perfil} dark />
            </div>
          </SheetContent>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </Sheet>
      </div>
    </header>
  );
}
