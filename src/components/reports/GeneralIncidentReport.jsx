import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from "@/lib/utils";

const typeLabels = {
  fire: 'Incendio',
  hazmat: 'Materiales Peligrosos',
  medical: 'Emergencia Médica',
  rescue: 'Rescate',
  natural_disaster: 'Desastre Natural',
  civil_emergency: 'Emergencia Civil',
  other: 'Otro'
};

const severityConfig = {
  low: { label: 'Bajo', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medio', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alto', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-700' }
};

const statusLabels = {
  active: 'Activo',
  contained: 'Contenido',
  resolved: 'Resuelto',
  monitoring: 'Monitoreo'
};

const roleLabels = {
  incident_commander: 'Comandante del Incidente',
  public_info_officer: 'Oficial de Información Pública',
  safety_officer: 'Oficial de Seguridad',
  liaison_officer: 'Oficial de Enlace',
  operations_chief: 'Jefe de Operaciones',
  planning_chief: 'Jefe de Planificación',
  logistics_chief: 'Jefe de Logística',
  finance_chief: 'Jefe de Finanzas/Admin'
};

export default function GeneralIncidentReport({ open, onClose, incident, staff = [], resources = [], institutions = [], activities = [] }) {
  const reportRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(`Reporte-General-${incident?.incident_number || 'incidente'}.pdf`);
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Reporte General del Incidente</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={reportRef} className="space-y-6 pt-4 bg-white">
          {/* Header del reporte */}
          <div className="border-b-2 border-orange-500 pb-4">
            <div className="flex items-start gap-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/1ee2fb157_LogoSCI.jpg" 
                alt="Logo SCI"
                className="w-24 h-16 object-contain"
              />
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-orange-600">REPORTE GENERAL DEL INCIDENTE</h1>
                <p className="text-lg font-semibold text-slate-700 mt-2">{incident.name}</p>
                <p className="text-sm text-slate-500">Incidente #{incident.incident_number || 'N/A'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Generado: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                </p>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/93620ed88_LogoSENAPRED.png" 
                alt="Logo SENAPRED"
                className="w-24 h-16 object-contain"
              />
            </div>
          </div>

          {/* Información General */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">1. INFORMACIÓN GENERAL</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Nombre del Incidente</p>
                <p className="text-base font-semibold text-slate-900">{incident.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Número de Incidente</p>
                <p className="text-base font-semibold text-slate-900">#{incident.incident_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tipo de Incidente</p>
                <p className="text-base text-slate-900">{typeLabels[incident.type] || incident.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Estado</p>
                <Badge variant="outline" className="mt-1">{statusLabels[incident.status] || incident.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Severidad</p>
                <Badge className={cn("mt-1", severityConfig[incident.severity]?.color)}>
                  {severityConfig[incident.severity]?.label || incident.severity}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Comandante del Incidente</p>
                <p className="text-base text-slate-900">{incident.incident_commander || 'No asignado'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Ubicación</p>
                <p className="text-base text-slate-900">{incident.location}</p>
                {incident.region && <p className="text-sm text-slate-600">Región: {incident.region}</p>}
                {incident.provincia && <p className="text-sm text-slate-600">Provincia: {incident.provincia}</p>}
                {incident.comuna && <p className="text-sm text-slate-600">Comuna: {incident.comuna}</p>}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Fecha de Inicio</p>
                <p className="text-base text-slate-900">
                  {incident.start_time ? format(new Date(incident.start_time), "dd/MM/yyyy HH:mm", { locale: es }) : 'No especificado'}
                </p>
                {incident.end_time && (
                  <>
                    <p className="text-xs text-slate-500 font-medium mt-2">Fecha de Finalización</p>
                    <p className="text-base text-slate-900">
                      {format(new Date(incident.end_time), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </>
                )}
              </div>
            </div>

            {incident.description && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium">Descripción</p>
                <p className="text-base text-slate-700 mt-1">{incident.description}</p>
              </div>
            )}

            {incident.objectives && incident.objectives.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium">Objetivos</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {incident.objectives.map((obj, idx) => (
                    <li key={idx} className="text-base text-slate-700">{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Estructura de Comando */}
          {staff.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">2. ESTRUCTURA DE COMANDO (ICS)</h2>
              <div className="grid grid-cols-2 gap-4">
                {staff.map((member) => (
                  <div key={member.id} className="border rounded-lg p-3 bg-slate-50">
                    <p className="text-xs text-orange-600 font-semibold mb-1">
                      {roleLabels[member.role] || member.role}
                    </p>
                    <p className="text-base font-semibold text-slate-900">{member.name}</p>
                    {member.contact && (
                      <p className="text-sm text-slate-600 mt-1">Contacto: {member.contact}</p>
                    )}
                    {member.radio_channel && (
                      <p className="text-sm text-slate-600">Canal: {member.radio_channel}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Instituciones Presentes */}
          {institutions.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">3. INSTITUCIONES PRESENTES</h2>
              <div className="space-y-3">
                {institutions.map((inst) => (
                  <div key={inst.id} className="border rounded-lg p-3 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-base font-semibold text-slate-900">{inst.nombre}</p>
                      {inst.units_deployed > 0 && (
                        <Badge variant="secondary">{inst.units_deployed} unidad(es)</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {inst.contact_person && (
                        <p className="text-slate-600">Contacto: {inst.contact_person}</p>
                      )}
                      {inst.phone && (
                        <p className="text-slate-600">Teléfono: {inst.phone}</p>
                      )}
                    </div>
                    {inst.detalle_recursos && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-xs font-medium text-slate-700">Recursos:</p>
                        <p className="text-sm text-slate-600">{inst.detalle_recursos}</p>
                      </div>
                    )}
                    {inst.arrival_time && (
                      <p className="text-xs text-slate-400 mt-1">
                        Llegada: {format(new Date(inst.arrival_time), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recursos Asignados */}
          {resources.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">4. RECURSOS ASIGNADOS</h2>
              <div className="grid grid-cols-2 gap-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="border rounded-lg p-3 bg-slate-50">
                    <p className="text-base font-semibold text-slate-900">{resource.name}</p>
                    <p className="text-sm text-slate-600">Tipo: {resource.type}</p>
                    {resource.category && (
                      <p className="text-sm text-slate-600">Categoría: {resource.category}</p>
                    )}
                    <p className="text-sm text-slate-600">Cantidad: {resource.quantity || 1}</p>
                    <Badge className="mt-2" variant={resource.status === 'deployed' ? 'default' : 'secondary'}>
                      {resource.status === 'deployed' ? 'Desplegado' :
                       resource.status === 'available' ? 'Disponible' :
                       resource.status === 'en_route' ? 'En Camino' : 'Fuera de Servicio'}
                    </Badge>
                    {resource.notes && (
                      <p className="text-xs text-slate-500 mt-2">{resource.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bitácora de Actividades */}
          {activities.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">5. BITÁCORA DE ACTIVIDADES</h2>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.category || 'general'}
                        </Badge>
                        {activity.priority === 'critical' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Crítico</Badge>
                        )}
                        {activity.priority === 'warning' && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Advertencia</Badge>
                        )}
                      </div>
                      <p className="text-base text-slate-900">{activity.action}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>{format(new Date(activity.timestamp || activity.created_date), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                        {activity.reported_by && <span>Reportado por: {activity.reported_by}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Formularios SCI Disponibles */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">6. FORMULARIOS SCI DISPONIBLES</h2>
            <p className="text-sm text-slate-600 mb-4">
              Los siguientes formularios SCI están disponibles para este incidente y pueden ser generados individualmente desde el detalle del incidente:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded p-3 bg-blue-50">
                <p className="font-semibold text-sm text-blue-900">SCI-201</p>
                <p className="text-xs text-blue-700">Resumen del Incidente</p>
              </div>
              <div className="border rounded p-3 bg-indigo-50">
                <p className="font-semibold text-sm text-indigo-900">SCI-202</p>
                <p className="text-xs text-indigo-700">Plan de Acción del Incidente</p>
              </div>
              <div className="border rounded p-3 bg-purple-50">
                <p className="font-semibold text-sm text-purple-900">SCI-203</p>
                <p className="text-xs text-purple-700">Listado de Asignación</p>
              </div>
              <div className="border rounded p-3 bg-pink-50">
                <p className="font-semibold text-sm text-pink-900">SCI-204</p>
                <p className="text-xs text-pink-700">Asignaciones Tácticas</p>
              </div>
              <div className="border rounded p-3 bg-teal-50">
                <p className="font-semibold text-sm text-teal-900">SCI-205</p>
                <p className="text-xs text-teal-700">Plan de Comunicaciones</p>
              </div>
              <div className="border rounded p-3 bg-rose-50">
                <p className="font-semibold text-sm text-rose-900">SCI-206</p>
                <p className="text-xs text-rose-700">Plan Médico</p>
              </div>
              <div className="border rounded p-3 bg-red-50">
                <p className="font-semibold text-sm text-red-900">SCI-207</p>
                <p className="text-xs text-red-700">Registro de Víctimas</p>
              </div>
              <div className="border rounded p-3 bg-slate-50">
                <p className="font-semibold text-sm text-slate-900">SCI-211</p>
                <p className="text-xs text-slate-700">Registro y Control de Recursos</p>
              </div>
              <div className="border rounded p-3 bg-cyan-50">
                <p className="font-semibold text-sm text-cyan-900">SCI-214</p>
                <p className="text-xs text-cyan-700">Registro de Actividades</p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 pt-6 border-t">
            <p>Este reporte fue generado automáticamente por el Sistema ICS Command</p>
            <p>Fecha de generación: {format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}