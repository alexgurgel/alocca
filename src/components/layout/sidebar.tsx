import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import type { Perfil } from "@/types";

export function Sidebar({ perfil }: { perfil: Perfil }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0d1321] lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/painel">
          <Logo variant="dark" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <SidebarNav perfil={perfil} />
      </div>
      <div className="border-t border-white/10 p-3">
        <UserMenu perfil={perfil} dark />
      </div>
    </aside>
  );
}
