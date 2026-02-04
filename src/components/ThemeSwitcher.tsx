import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
      <Badge 
        className="absolute -top-1 -right-1 px-1 py-0 text-[10px] bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 pointer-events-none"
      >
        NEW
      </Badge>
    </div>
  );
}
