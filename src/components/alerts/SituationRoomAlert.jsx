import React, { useEffect, useState } from 'react';
import { AlertTriangle, Flame, Radio, Users, TrendingUp, Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const severityConfig = {
  low: {
    bg: 'from-blue-950 to-blue-900',
    border: 'border-blue-500',
    glow: 'shadow-blue-500/30',
    icon: Radio,
    label: 'NIVEL BAJO',
    iconColor: 'text-blue-400'
  },
  medium: {
    bg: 'from-yellow-950 to-yellow-900',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/30',
    icon: TrendingUp,
    label: 'NIVEL MEDIO',
    iconColor: 'text-yellow-400'
  },
  high: {
    bg: 'from-orange-950 to-orange-900',
    border: 'border-orange-500',
    glow: 'shadow-orange-500/30',
    icon: Flame,
    label: 'NIVEL ALTO',
    iconColor: 'text-orange-400'
  },
  critical: {
    bg: 'from-red-950 to-red-900',
    border: 'border-red-500',
    glow: 'shadow-red-500/30',
    icon: AlertTriangle,
    label: 'NIVEL CRÍTICO',
    iconColor: 'text-red-400'
  }
};

export default function SituationRoomAlert({ 
  severity = 'medium', 
  title, 
  message, 
  details = [],
  onDismiss,
  autoHide = false,
  duration = 10000 
}) {
  const [visible, setVisible] = useState(true);
  const config = severityConfig[severity] || severityConfig.medium;
  const Icon = config.icon;

  useEffect(() => {
    if (autoHide && duration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 shadow-2xl",
          `bg-gradient-to-r ${config.bg}`,
          config.border,
          config.glow
        )}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className={cn(
            "absolute inset-0 animate-pulse",
            severity === 'critical' && "bg-gradient-to-r from-transparent via-red-500 to-transparent"
          )} />
        </div>

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center animate-pulse shadow-xl",
              config.border,
              `bg-gradient-to-br ${config.bg}`
            )}>
              <Icon className={cn("w-8 h-8", config.iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "text-xs font-bold tracking-widest px-3 py-1 rounded-full border-2",
                  config.border,
                  config.iconColor
                )}>
                  {config.label}
                </span>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">
                {title}
              </h3>

              {/* Message */}
              <p className="text-slate-300 text-sm font-medium mb-4">
                {message}
              </p>

              {/* Details Grid */}
              {details.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {details.map((detail, idx) => (
                    <div 
                      key={idx}
                      className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                    >
                      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                        {detail.label}
                      </p>
                      <p className="text-white font-bold text-lg">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dismiss button */}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setVisible(false);
                  onDismiss();
                }}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Pulse indicator for critical */}
          {severity === 'critical' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse" />
            </div>
          )}
        </div>

        {/* Corner decoration */}
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-10",
          config.iconColor
        )}>
          <Icon className="w-full h-full" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}