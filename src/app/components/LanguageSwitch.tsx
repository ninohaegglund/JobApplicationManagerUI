import { Languages } from "lucide-react";
import {
  useLanguage,
  type Language,
  type TranslationKey,
} from "../../context/LanguageContext";
import { cn } from "./ui/utils";

const languageOptions: Array<{
  value: Language;
  shortLabel: string;
  labelKey: TranslationKey;
}> = [
  { value: "en", shortLabel: "EN", labelKey: "language.english" },
  { value: "sv", shortLabel: "SV", labelKey: "language.swedish" },
];

export function LanguageSwitch({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-white p-1",
        className
      )}
      role="group"
      aria-label={t("language.switchLabel")}
    >
      <Languages className="ml-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      {languageOptions.map((option) => {
        const isActive = language === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLanguage(option.value)}
            className={cn(
              "min-w-9 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-[#fafafa] hover:text-foreground"
            )}
            aria-pressed={isActive}
            title={t(option.labelKey)}
          >
            {option.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
