import { cn } from "@/lib/utils";

type LogoVariant = "default" | "dark" | "mono";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  tagline?: boolean;
  /**
   * "default": para fundos claros. "dark": para fundos escuros sólidos
   * (sidebar, menu mobile). "mono": versão totalmente branca, para usar
   * sobre o próprio gradiente da marca (onde o ícone em gradiente perderia
   * contraste).
   */
  variant?: LogoVariant;
}

export function LogoIcon({ className, mono = false }: { className?: string; mono?: boolean }) {
  const fill = mono ? "#FFFFFF" : "url(#alocca-mark-gradient)";

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-8 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!mono ? (
        <defs>
          <linearGradient id="alocca-mark-gradient" x1="4" y1="6" x2="36" y2="34">
            <stop offset="0%" stopColor="#1C6CFF" />
            <stop offset="100%" stopColor="#7B3FF2" />
          </linearGradient>
        </defs>
      ) : null}

      {/* arco esquerdo */}
      <path d="M13 10.5C9.2 12.6 6.6 16 5.6 20.2" stroke={fill} strokeWidth="2" strokeLinecap="round" />
      {/* arco direito */}
      <path d="M27 10.5c3.8 2.1 6.4 5.5 7.4 9.7" stroke={fill} strokeWidth="2" strokeLinecap="round" />
      {/* sorriso */}
      <path
        d="M11.5 30c2.4 2.6 5.2 3.9 8.5 3.9s6.1-1.3 8.5-3.9"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* pessoa superior */}
      <circle cx="20" cy="11.2" r="4.4" fill={fill} />
      <path d="M12.4 24.6a7.6 7.6 0 0 1 15.2 0v1.4h-15.2z" fill={fill} />

      {/* pessoa inferior esquerda */}
      <circle cx="10.6" cy="24.4" r="3.6" fill={fill} />
      <path d="M4.4 35.6a6.2 6.2 0 0 1 12.4 0v1h-12.4z" fill={fill} />

      {/* pessoa inferior direita */}
      <circle cx="29.4" cy="24.4" r="3.6" fill={fill} />
      <path d="M23.2 35.6a6.2 6.2 0 0 1 12.4 0v1h-12.4z" fill={fill} />
    </svg>
  );
}

export function Logo({ className, iconOnly = false, tagline = false, variant = "default" }: LogoProps) {
  const mono = variant === "mono";
  const dark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon mono={mono} />
      {!iconOnly ? (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tight">
            <span className={mono ? "text-white" : "text-brand-gradient"}>A</span>
            <span className={dark || mono ? "text-white" : "text-foreground"}>locca</span>
          </span>
          {tagline ? (
            <span
              className={cn(
                "mt-0.5 text-[11px] font-medium tracking-wide",
                dark || mono ? "text-white/80" : "text-primary"
              )}
            >
              Conecta. Aloca. Resolve.
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
