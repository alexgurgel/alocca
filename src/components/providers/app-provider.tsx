"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Empresa, Perfil } from "@/types";

interface AppContextValue {
  perfil: Perfil;
  empresa: Empresa | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  perfil,
  empresa,
  children,
}: AppContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ perfil, empresa }), [perfil, empresa]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext deve ser usado dentro de <AppProvider>");
  }
  return ctx;
}
