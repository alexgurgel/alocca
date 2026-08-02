import type { ReactNode } from "react";
import { AuthenticatedLayoutClient } from "@/components/providers/authenticated-layout-client";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayoutClient mode="admin">{children}</AuthenticatedLayoutClient>;
}
