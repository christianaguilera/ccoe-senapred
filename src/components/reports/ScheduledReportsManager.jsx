import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Edit, 
  Plus,
  Mail,
  FileText
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ScheduledReportsManager({ config }) {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    report_type: config?.reportType || 'incidents',
    format: config?.format || 'pdf',
    frequency: 'weekly',
    recipients: '',
    filters: config?.filters || {},
    active: true
  });

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['scheduledReports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast.success('Reporte programado creado');
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast.success('Reporte programado actualizado');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast.success('Reporte programado eliminado');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.ScheduledReport.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      report_type: config?.reportType || 'incidents',
      format: config?.format || 'pdf',
      frequency: 'weekly',
      recipients: '',
      filters: config?.filters || {},
      active: true
    });
    setEditingReport(null);
  };

  const handleSubmit = () => {
    const recipientsArray = formData.recipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    const data = {
      ...formData,
      recipients: recipientsArray
    };

    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      report_type: report.report_type,
      format: report.format,
      frequency: report.frequency,
      recipients: report.recipients?.join(', ') || '',
      filters: report.filters || {},
      active: report.active
    });
    setShowDialog(true);
  };

  const openNewDialog = () => {
    resetForm();
    if (config) {
      setFormData(prev => ({
        ...prev,
        report_type: config.reportType,
        format: config.format,
        filters: config.filters
      }));
    }
    setShowDialog(true);
  };

  const frequencyLabels = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual'
  };

  const reportTypeLabels = {
    incidents: 'Incidentes',
    resources: 'Recursos',
    alerts: 'Alertas',
    activities: 'Actividades',
    custom: 'Personalizado'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={cn(
            "text-lg font-semibold",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            Reportes Programados
          </h3>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Gestiona la generación automática de reportes
          </p>
        </div>
        <Button onClick={openNewDialog} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo
        </Button>
      </div>

      <div className="grid gap-4">
        {scheduledReports.length === 0 ? (
          <Card className={cn(
            "p-8 text-center",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
          )}>
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              No hay reportes programados
            </p>
          </Card>
        ) : (
          scheduledReports.map(report => (
            <Card key={report.id} className={cn(
              "p-5",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h4 className={cn(
                      "font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {report.name}
                    </h4>
                    {report.active ? (
                      <Badge className="bg-green-500">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </div>
                  <div className={cn(
                    "flex flex-wrap gap-3 text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {reportTypeLabels[report.report_type]} ({report.format.toUpperCase()})
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {frequencyLabels[report.frequency]}
                    </div>
                    {report.recipients?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {report.recipients.length} destinatario{report.recipients.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  {report.last_generated && (
                    <p className="text-xs text-slate-500 mt-2">
                      Último: {format(new Date(report.last_generated), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={report.active}
                    onCheckedChange={(checked) => 
                      toggleActiveMutation.mutate({ id: report.id, active: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(report)}
                    className={isDarkMode ? "hover:bg-slate-800" : ""}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('¿Eliminar este reporte programado?')) {
                        deleteMutation.mutate(report.id);
                      }
                    }}
                    className={cn(
                      isDarkMode ? "hover:bg-slate-800 text-red-400" : "text-red-600"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className={cn(
          "max-w-lg",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? "text-white" : "text-slate-900"}>
              {editingReport ? 'Editar' : 'Nuevo'} Reporte Programado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isDarkMode ? "text-slate-300" : ""}>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Reporte Semanal de Incidentes"
                className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={isDarkMode ? "text-slate-300" : ""}>Tipo</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(value) => setFormData({ ...formData, report_type: value })}
                >
                  <SelectTrigger className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incidents">Incidentes</SelectItem>
                    <SelectItem value="resources">Recursos</SelectItem>
                    <SelectItem value="alerts">Alertas</SelectItem>
                    <SelectItem value="activities">Actividades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isDarkMode ? "text-slate-300" : ""}>Formato</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value })}
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

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-slate-300" : ""}>Frecuencia</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-slate-300" : ""}>
                Destinatarios (separados por coma)
              </Label>
              <Input
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="email1@example.com, email2@example.com"
                className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {editingReport ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}