import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileDown, 
  Settings2,
  Calendar,
  Filter
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../contexts/ThemeContext';

export default function CustomReportBuilder({ onGenerate }) {
  const { isDarkMode } = useTheme();
  const [config, setConfig] = useState({
    reportType: 'incidents',
    format: 'pdf',
    dateRange: {
      start: '',
      end: ''
    },
    fields: {
      incidents: {
        number: true,
        name: true,
        type: true,
        status: true,
        severity: true,
        location: true,
        commander: true,
        startTime: true,
        description: false
      },
      resources: {
        name: true,
        type: true,
        status: true,
        assigned: true,
        quantity: true
      },
      alerts: {
        type: true,
        region: true,
        phenomenon: true,
        description: true,
        time: true
      }
    },
    filters: {
      type: 'all',
      status: 'all',
      severity: 'all'
    },
    includeCharts: false,
    includeMap: false
  });

  const handleFieldToggle = (category, field) => {
    setConfig(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [category]: {
          ...prev.fields[category],
          [field]: !prev.fields[category][field]
        }
      }
    }));
  };

  const getFieldsForType = () => {
    const typeMap = {
      incidents: [
        { key: 'number', label: 'Número' },
        { key: 'name', label: 'Nombre' },
        { key: 'type', label: 'Tipo' },
        { key: 'status', label: 'Estado' },
        { key: 'severity', label: 'Severidad' },
        { key: 'location', label: 'Ubicación' },
        { key: 'commander', label: 'Comandante' },
        { key: 'startTime', label: 'Fecha Inicio' },
        { key: 'description', label: 'Descripción' }
      ],
      resources: [
        { key: 'name', label: 'Nombre' },
        { key: 'type', label: 'Tipo' },
        { key: 'status', label: 'Estado' },
        { key: 'assigned', label: 'Asignado a' },
        { key: 'quantity', label: 'Cantidad' }
      ],
      alerts: [
        { key: 'type', label: 'Tipo de Alerta' },
        { key: 'region', label: 'Región' },
        { key: 'phenomenon', label: 'Fenómeno' },
        { key: 'description', label: 'Descripción' },
        { key: 'time', label: 'Hora' }
      ]
    };
    return typeMap[config.reportType] || [];
  };

  return (
    <Card className={cn(
      "p-6",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
    )}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className={cn(
            "w-5 h-5",
            isDarkMode ? "text-orange-400" : "text-orange-600"
          )} />
          <h3 className={cn(
            "text-lg font-semibold",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            Constructor de Reportes Personalizados
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Reporte */}
          <div className="space-y-2">
            <Label className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
              Tipo de Reporte
            </Label>
            <Select
              value={config.reportType}
              onValueChange={(value) => setConfig({ ...config, reportType: value })}
            >
              <SelectTrigger className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incidents">Incidentes</SelectItem>
                <SelectItem value="resources">Recursos</SelectItem>
                <SelectItem value="alerts">Alertas</SelectItem>
                <SelectItem value="activities">Actividades</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
              Formato
            </Label>
            <Select
              value={config.format}
              onValueChange={(value) => setConfig({ ...config, format: value })}
            >
              <SelectTrigger className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rango de Fechas */}
        <div>
          <Label className={cn(
            "flex items-center gap-2 mb-2",
            isDarkMode ? "text-slate-300" : "text-slate-700"
          )}>
            <Calendar className="w-4 h-4" />
            Rango de Fechas
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              value={config.dateRange.start}
              onChange={(e) => setConfig({
                ...config,
                dateRange: { ...config.dateRange, start: e.target.value }
              })}
              className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}
            />
            <Input
              type="date"
              value={config.dateRange.end}
              onChange={(e) => setConfig({
                ...config,
                dateRange: { ...config.dateRange, end: e.target.value }
              })}
              className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}
            />
          </div>
        </div>

        {/* Campos a Incluir */}
        <div>
          <Label className={cn(
            "flex items-center gap-2 mb-3",
            isDarkMode ? "text-slate-300" : "text-slate-700"
          )}>
            <Filter className="w-4 h-4" />
            Campos a Incluir
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getFieldsForType().map(field => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={config.fields[config.reportType]?.[field.key]}
                  onCheckedChange={() => handleFieldToggle(config.reportType, field.key)}
                />
                <label
                  htmlFor={field.key}
                  className={cn(
                    "text-sm cursor-pointer",
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones Adicionales */}
        {config.format === 'pdf' && (
          <div>
            <Label className={cn(
              "mb-3 block",
              isDarkMode ? "text-slate-300" : "text-slate-700"
            )}>
              Opciones Adicionales (PDF)
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => setConfig({ ...config, includeCharts: checked })}
                />
                <label
                  htmlFor="charts"
                  className={cn(
                    "text-sm cursor-pointer",
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  Incluir gráficos estadísticos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="map"
                  checked={config.includeMap}
                  onCheckedChange={(checked) => setConfig({ ...config, includeMap: checked })}
                />
                <label
                  htmlFor="map"
                  className={cn(
                    "text-sm cursor-pointer",
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  Incluir mapa de ubicaciones
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => onGenerate({ ...config, action: 'generate' })}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {config.format === 'pdf' ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generar PDF
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Generar CSV
              </>
            )}
          </Button>
          <Button
            onClick={() => onGenerate({ ...config, action: 'schedule' })}
            variant="outline"
            className={isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Programar Reporte
          </Button>
        </div>
      </div>
    </Card>
  );
}