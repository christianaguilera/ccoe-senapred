import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  return (
    <Card className="p-6 border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-2",
              trend > 0 ? "text-red-500" : "text-emerald-500"
            )}>
              {trend > 0 ? '+' : ''}{trend} desde ayer
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}