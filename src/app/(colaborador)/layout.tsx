import type { ReactNode } from "react";
import { AuthenticatedLayoutClient } from "@/components/providers/authenticated-layout-client";

export default function ColaboradorLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayoutClient mode="colaborador">{children}</AuthenticatedLayoutClient>;
}
