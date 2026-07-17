import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

export function BrandLogo({
  className,
  showText = true,
  variant = "default",
  size = "default",
}: {
  className?: string;
  showText?: boolean;
  variant?: "default" | "light";
  size?: "default" | "compact";
}) {
  const { t, dir } = useApp();
  const textColor = variant === "light" ? "text-white" : "text-foreground";
  const sub = variant === "light" ? "text-white/60" : "text-muted-foreground";
  const compact = size === "compact";
  return (
    <div className={cn("flex items-center gap-3 md:gap-4 min-w-0", compact && "gap-2 md:gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl overflow-hidden",
          variant === "light" ? "bg-transparent" : "bg-[#001827] p-0.5 md:p-1 shadow-elegant",
          compact && "p-0.5",
        )}
      >
        <img
          src="/alinma-logo.png"
          alt="Alinma Bank"
          className={cn(
            "w-auto object-contain",
            compact ? "h-8 sm:h-9 md:h-10" : "h-10 sm:h-12 md:h-14",
          )}
          draggable={false}
        />
      </div>
      {showText && (
        <div
          className={cn("flex flex-col leading-tight gap-0.5 md:gap-1 min-w-0", dir === "rtl" ? "text-right" : "text-left")}
        >
          <span className={cn("font-display font-bold leading-tight", compact ? "text-[11px] md:text-[12px]" : "text-[12px] md:text-[14px]", textColor)}>{t("appName")}</span>
          <span className={cn("font-light tracking-wide leading-tight", compact ? "text-[8px] md:text-[9px]" : "text-[9px] md:text-[10px]", sub)}>{t("appSub")}</span>
        </div>
      )}
    </div>
  );
}