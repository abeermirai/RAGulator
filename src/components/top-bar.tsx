import { Bell, Search, Moon, Sun, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, toggleTheme, toggleLang, t, dir, lang } = useApp();
  const currentLangLabel = lang === "ar" ? "العربية" : "English";
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-8">
        {/* User profile on the left in RTL */}
        <div className="flex items-center gap-3 order-first">
          <Avatar className="h-11 w-11 ring-2 ring-[#E28A6D]/40">
            <AvatarFallback className="bg-brand-gradient text-white text-sm font-bold">
              {t("userInitials")}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">{t("userName")}</p>
            <p className="text-[11px] text-muted-foreground">{t("userRole")}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} title={t("themeToggle")}>
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLang}
          className="gap-2 h-9 rounded-full px-3 text-xs font-semibold border-border bg-surface hover:bg-accent"
          title={t("langToggle")}
        >
          <Globe className="h-4 w-4 text-[#5E6BB2]" />
          <span>{currentLangLabel}</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative h-10 w-10" aria-label="Notifications">
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-[#E28A6D] p-0 px-1 text-[10px] font-bold text-white leading-none flex items-center justify-center">1</Badge>
        </Button>
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
            <Input
              placeholder={t("searchPh")}
              className={`${dir === "rtl" ? "pr-9" : "pl-9"} h-10 bg-surface border-border`}
            />
          </div>
        </div>
        {/* Title */}
        <div className={`${dir === "rtl" ? "mr-auto text-right" : "ml-auto text-left"} min-w-0`}>
          <h1 className="truncate font-display text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}