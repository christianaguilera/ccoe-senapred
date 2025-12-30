import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Download, 
  FileDown,
  BarChart3,
  TrendingUp,
  FileEdit,
  Calendar,
  Settings2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import ReportFilters from '../components/reports/ReportFilters';
import ReportTable from '../components/reports/ReportTable';
import FormSCI201 from '../components/reports/FormSCI201';
import CustomReportBuilder from '../components/reports/CustomReportBuilder';
import ScheduledReportsManager from '../components/reports/ScheduledReportsManager';
import { cn } from "@/lib/utils";
import { useTheme } from '../components/contexts/ThemeContext';

const typeLabels = {
  fire: 'Incendio',
  hazmat: 'Materiales Peligrosos',
  medical: 'Emergencia Médica',
  rescue: 'Rescate',
  natural_disaster: 'Desastre Natural',
  civil_emergency: 'Emergencia Civil',
  other: 'Otro'
};

const statusLabels = {
  active: 'Activo',
  contained: 'Contenido',
  resolved: 'Resuelto',
  monitoring: 'Monitoreo'
};

const severityLabels = {
  minor_emergency: 'Emergencia Menor',
  major_emergency: 'Emergencia Mayor',
  disaster: 'Desastre',
  catastrophe: 'Catástrofe'
};

export default function Reports() {
  const { isDarkMode } = useTheme();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    status: 'all',
    severity: 'all'
  });
  const [activeTab, setActiveTab] = useState('standard');
  const [showSCI201, setShowSCI201] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [customReportConfig, setCustomReportConfig] = useState(null);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 500),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date', 500),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 1000),
  });

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Date filters
      if (filters.startDate && incident.start_time) {
        const incidentDate = new Date(incident.start_time);
        const startDate = new Date(filters.startDate);
        if (incidentDate < startDate) return false;
      }
      if (filters.endDate && incident.start_time) {
        const incidentDate = new Date(incident.start_time);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (incidentDate > endDate) return false;
      }

      // Type filter
      if (filters.type !== 'all' && incident.type !== filters.type) return false;

      // Status filter
      if (filters.status !== 'all' && incident.status !== filters.status) return false;

      // Severity filter
      if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;

      return true;
    });
  }, [incidents, filters]);

  const stats = useMemo(() => {
    return {
      total: filteredIncidents.length,
      active: filteredIncidents.filter(i => i.status === 'active').length,
      critical: filteredIncidents.filter(i => i.severity === 'critical').length,
      resolved: filteredIncidents.filter(i => i.status === 'resolved').length,
    };
  }, [filteredIncidents]);

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: 'all',
      status: 'all',
      severity: 'all'
    });
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Nombre', 'Tipo', 'Estado', 'Severidad', 'Ubicación', 'Fecha Inicio', 'Comandante'];
    const rows = filteredIncidents.map(incident => [
      incident.incident_number || 'N/A',
      incident.name || '',
      typeLabels[incident.type] || incident.type,
      statusLabels[incident.status] || incident.status,
      severityLabels[incident.severity] || incident.severity,
      incident.location || '',
      incident.start_time ? format(new Date(incident.start_time), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A',
      incident.incident_commander || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_incidentes_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Incidentes', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Date range
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateText = `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`;
    doc.text(dateText, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Incidentes: ${stats.total}`, 14, y);
    y += 6;
    doc.text(`Activos: ${stats.active}`, 14, y);
    y += 6;
    doc.text(`Críticos: ${stats.critical}`, 14, y);
    y += 6;
    doc.text(`Resueltos: ${stats.resolved}`, 14, y);
    y += 12;

    // Filters applied
    if (filters.startDate || filters.endDate || filters.type !== 'all' || filters.status !== 'all' || filters.severity !== 'all') {
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros Aplicados:', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      
      if (filters.startDate) {
        doc.text(`Fecha Inicio: ${format(new Date(filters.startDate), 'dd/MM/yyyy')}`, 14, y);
        y += 6;
      }
      if (filters.endDate) {
        doc.text(`Fecha Fin: ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`, 14, y);
        y += 6;
      }
      if (filters.type !== 'all') {
        doc.text(`Tipo: ${typeLabels[filters.type]}`, 14, y);
        y += 6;
      }
      if (filters.status !== 'all') {
        doc.text(`Estado: ${statusLabels[filters.status]}`, 14, y);
        y += 6;
      }
      if (filters.severity !== 'all') {
        doc.text(`Severidad: ${severityLabels[filters.severity]}`, 14, y);
        y += 6;
      }
      y += 6;
    }

    // Incidents list
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Incidentes', 14, y);
    y += 8;

    filteredIncidents.forEach((incident, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${incident.incident_number || 'N/A'} - ${incident.name}`, 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Tipo: ${typeLabels[incident.type] || incident.type}`, 14, y);
      y += 5;
      doc.text(`Estado: ${statusLabels[incident.status] || incident.status} | Severidad: ${severityLabels[incident.severity] || incident.severity}`, 14, y);
      y += 5;
      doc.text(`Ubicacion: ${incident.location || 'N/A'}`, 14, y);
      y += 5;
      if (incident.start_time) {
        doc.text(`Inicio: ${format(new Date(incident.start_time), 'dd/MM/yyyy HH:mm')}`, 14, y);
        y += 5;
      }
      if (incident.incident_commander) {
        doc.text(`Comandante: ${incident.incident_commander}`, 14, y);
        y += 5;
      }
      y += 3;
    });

    doc.save(`reporte_incidentes_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const handleCustomReportGeneration = (config) => {
    setCustomReportConfig(config);
    
    if (config.action === 'generate') {
      // Generate report immediately
      if (config.format === 'pdf') {
        generateCustomPDF(config);
      } else {
        generateCustomCSV(config);
      }
    } else if (config.action === 'schedule') {
      // Switch to scheduled tab
      setActiveTab('scheduled');
    }
  };

  const generateCustomPDF = (config) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reporte ${config.reportType === 'incidents' ? 'de Incidentes' : config.reportType === 'resources' ? 'de Recursos' : 'de Alertas'}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    if (config.reportType === 'incidents') {
      const data = filteredIncidents;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${data.length} incidentes`, 14, y);
      y += 10;

      data.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${item.name}`, 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        if (config.fields.incidents.location) {
          doc.text(`Ubicación: ${item.location || 'N/A'}`, 14, y);
          y += 5;
        }
        if (config.fields.incidents.status) {
          doc.text(`Estado: ${statusLabels[item.status]}`, 14, y);
          y += 5;
        }
        y += 3;
      });
    } else if (config.reportType === 'resources') {
      const data = resources;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${data.length} recursos`, 14, y);
      y += 10;

      data.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${item.name}`, 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Tipo: ${item.type} | Estado: ${item.status}`, 14, y);
        y += 5;
        y += 3;
      });
    }

    doc.save(`reporte_personalizado_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
    toast.success('Reporte PDF generado correctamente');
  };

  const generateCustomCSV = (config) => {
    let headers = [];
    let rows = [];

    if (config.reportType === 'incidents') {
      const fields = config.fields.incidents;
      if (fields.number) headers.push('Número');
      if (fields.name) headers.push('Nombre');
      if (fields.type) headers.push('Tipo');
      if (fields.status) headers.push('Estado');
      if (fields.severity) headers.push('Severidad');
      if (fields.location) headers.push('Ubicación');
      if (fields.commander) headers.push('Comandante');
      if (fields.startTime) headers.push('Fecha Inicio');

      rows = filteredIncidents.map(item => {
        const row = [];
        if (fields.number) row.push(item.incident_number || 'N/A');
        if (fields.name) row.push(item.name);
        if (fields.type) row.push(typeLabels[item.type]);
        if (fields.status) row.push(statusLabels[item.status]);
        if (fields.severity) row.push(severityLabels[item.severity]);
        if (fields.location) row.push(item.location || '');
        if (fields.commander) row.push(item.incident_commander || '');
        if (fields.startTime) row.push(item.start_time ? format(new Date(item.start_time), 'dd/MM/yyyy HH:mm') : '');
        return row;
      });
    } else if (config.reportType === 'resources') {
      headers = ['Nombre', 'Tipo', 'Estado', 'Cantidad'];
      rows = resources.map(item => [
        item.name,
        item.type,
        item.status,
        item.quantity || 1
      ]);
    } else if (config.reportType === 'activities') {
      headers = ['Fecha', 'Acción', 'Categoría', 'Reportado Por'];
      rows = activities.map(item => [
        format(new Date(item.timestamp || item.created_date), 'dd/MM/yyyy HH:mm'),
        item.action,
        item.category,
        item.reported_by || ''
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_personalizado_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte CSV generado correctamente');
  };

  return (
    <div className={cn(
      "space-y-6 -m-8 p-8 min-h-screen",
      isDarkMode ? "bg-slate-950" : "bg-slate-100"
    )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "text-2xl font-bold",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>Sistema de Reportes Avanzados</h1>
          <p className={cn(
            "text-sm mt-1",
            isDarkMode ? "text-slate-400" : "text-slate-500"
          )}>
            Genera reportes personalizados, programa generación automática y exporta datos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={cn(
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <TabsTrigger value="standard" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Reportes Estándar
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Settings2 className="w-4 h-4 mr-2" />
            Reportes Personalizados
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Reportes Programados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredIncidents.length === 0}
              className={isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline"
              onClick={exportToPDF}
              disabled={filteredIncidents.length === 0}
              className={isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={cn(
              "p-5",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={cn(
                    "text-2xl font-bold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}>{stats.total}</p>
                  <p className="text-sm text-slate-500">Total Incidentes</p>
                </div>
              </div>
            </Card>

            <Card className={cn(
              "p-5 border-red-200",
              isDarkMode ? "bg-red-950 border-red-900" : "bg-red-50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{stats.active}</p>
                  <p className="text-sm text-red-600">Activos</p>
                </div>
              </div>
            </Card>

            <Card className={cn(
              "p-5 border-orange-200",
              isDarkMode ? "bg-orange-950 border-orange-900" : "bg-orange-50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{stats.critical}</p>
                  <p className="text-sm text-orange-600">Críticos</p>
                </div>
              </div>
            </Card>

            <Card className={cn(
              "p-5 border-emerald-200",
              isDarkMode ? "bg-emerald-950 border-emerald-900" : "bg-emerald-50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{stats.resolved}</p>
                  <p className="text-sm text-emerald-600">Resueltos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <ReportFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />

          {/* Results */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className={cn(
                  "h-20 w-full",
                  isDarkMode ? "bg-slate-800" : ""
                )} />
              ))}
            </div>
          ) : (
            <ReportTable 
              incidents={filteredIncidents}
              onOpenSCI201={(incident) => {
                setSelectedIncident(incident);
                setShowSCI201(true);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="custom">
          <CustomReportBuilder onGenerate={handleCustomReportGeneration} />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledReportsManager config={customReportConfig} />
        </TabsContent>
      </Tabs>

      {/* Formulario SCI-201 */}
      <FormSCI201 
        open={showSCI201}
        onClose={() => setShowSCI201(false)}
        incident={selectedIncident}
      />
    </div>
  );
}