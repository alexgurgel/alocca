"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { sair } from "@/services/auth.service";

export function SairButton({ className }: { className?: string }) {
  async function handleSair() {
    try {
      const supabase = createClient();
      await sair(supabase);
      window.location.assign("/entrar");
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  }

  return (
    <Button variant="outline" className={className} onClick={handleSair}>
      <LogOut />
      Sair
    </Button>
  );
}
