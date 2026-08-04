"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { NAV_ICON_MAP } from "./nav-icons";
import type { Perfil } from "@/types";

export function SidebarNav({ onNavigate, perfil }: { onNavigate?: () => void; perfil?: Perfil }) {
  const pathname = usePathname();
  const itens = NAV_ITEMS.filter(
    (item) => !("adminPlataformaOnly" in item) || perfil?.plano === "admin"
  );

  return (
    <nav className="flex flex-col gap-1">
      {itens.map((item) => {
        const Icon = NAV_ICON_MAP[item.icon];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                active ? "text-white" : "text-white/50 group-hover:text-white"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
