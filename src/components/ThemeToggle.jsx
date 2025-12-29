import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from './contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={cn(
        "relative",
        isDarkMode ? "text-yellow-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
      )}
      title={isDarkMode ? "Cambiar a modo luz" : "Cambiar a modo nocturno"}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}