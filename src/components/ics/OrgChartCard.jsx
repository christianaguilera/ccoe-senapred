import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Radio, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OrgChartCard({ role, title, member, level, color = "bg-slate-600", variant = "default" }) {
  const isEmpty = !member;

  return (
    <Card className={cn(
      "p-4 relative transition-all duration-200",
      variant === "commander" && "border-2 border-orange-500 shadow-lg",
      variant === "staff" && "border-l-4",
      variant === "section" && "border-2",
      isEmpty && "border-dashed bg-slate-50",
      !isEmpty && "hover:shadow-md cursor-pointer"
    )}
    style={{
      borderLeftColor: variant === "staff" ? color : undefined,
      borderColor: variant === "section" ? color : undefined
    }}>
      {/* Role Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isEmpty ? "bg-slate-200" : color
        )}>
          {isEmpty ? (
            <AlertCircle className="w-4 h-4 text-slate-400" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-semibold uppercase tracking-wide truncate",
            isEmpty ? "text-slate-400" : "text-slate-700"
          )}>
            {title}
          </p>
        </div>
      </div>

      {/* Member Info */}
      {isEmpty ? (
        <div className="text-center py-2">
          <p className="text-sm text-slate-400">Sin asignar</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-semibold text-slate-900">{member.name}</p>
          
          {member.contact && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Phone className="w-3 h-3" />
              <span>{member.contact}</span>
            </div>
          )}
          
          {member.radio_channel && (
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs">
                <Radio className="w-3 h-3 mr-1" />
                {member.radio_channel}
              </Badge>
            </div>
          )}
          
          {member.notes && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-2">
              {member.notes}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}