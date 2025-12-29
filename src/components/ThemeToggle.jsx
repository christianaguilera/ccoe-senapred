import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        "relative",
        isDark ? "text-yellow-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
      )}
      title={isDark ? "Cambiar a modo luz" : "Cambiar a modo nocturno"}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}