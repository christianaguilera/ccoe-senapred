import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI214({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    fecha_inicio_periodo: '',
    fecha_fin_periodo: '',
    personal_asignado: [
      { nombre: '', posicion: '', institucion: '' }
    ],
    actividades: [
      { hora: '', eventos: '' }
    ],
    preparado_por: ''
  });

  const handleAddPersonal = () => {
    setFormData({
      ...formData,
      personal_asignado: [...formData.personal_asignado, { nombre: '', posicion: '', institucion: '' }]
    });
  };

  const handlePersonalChange = (index, field, value) => {
    const newPersonal = [...formData.personal_asignado];
    newPersonal[index][field] = value;
    setFormData({ ...formData, personal_asignado: newPersonal });
  };

  const handleRemovePersonal = (index) => {
    if (formData.personal_asignado.length > 1) {
      const newPersonal = formData.personal_asignado.filter((_, i) => i !== index);
      setFormData({ ...formData, personal_asignado: newPersonal });
    }
  };

  const handleAddActividad = () => {
    setFormData({
      ...formData,
      actividades: [...formData.actividades, { hora: '', eventos: '' }]
    });
  };

  const handleActividadChange = (index, field, value) => {
    const newActividades = [...formData.actividades];
    newActividades[index][field] = value;
    setFormData({ ...formData, actividades: newActividades });
  };

  const handleRemoveActividad = (index) => {
    if (formData.actividades.length > 1) {
      const newActividades = formData.actividades.filter((_, i) => i !== index);
      setFormData({ ...formData, actividades: newActividades });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = formRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SCI-214-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-214 - Registro de Actividades</DialogTitle>
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

        <div ref={formRef} className="space-y-6 pt-4 bg-white">
          {/* Header del formulario */}
          <div className="border-b-2 border-orange-500 pb-4">
            <div className="flex items-start gap-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/1ee2fb157_LogoSCI.jpg" 
                alt="Logo SCI"
                className="w-24 h-16 object-contain"
              />
              <div className="flex-1 text-center">
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 214</h2>
                <p className="text-lg font-semibold text-slate-700">Registro de Actividades</p>
                <p className="text-xs text-slate-500">Rev. 064 - 2015</p>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/93620ed88_LogoSENAPRED.png" 
                alt="Logo SENAPRED"
                className="w-24 h-16 object-contain"
              />
            </div>
          </div>

          <Card className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">1. Nombre del Incidente:</Label>
                <Input
                  value={formData.nombre_incidente}
                  onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">2. Fecha y hora de preparación:</Label>
                <Input
                  value={formData.fecha_preparacion}
                  onChange={(e) => setFormData({ ...formData, fecha_preparacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">3. Periodo Operacional No.:</Label>
                <Input
                  value={formData.periodo_operacional}
                  onChange={(e) => setFormData({ ...formData, periodo_operacional: e.target.value })}
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">4. Fecha y hora de Inicio del Periodo Operacional:</Label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_inicio_periodo}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_periodo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">5. Fecha y hora de Finalización del Periodo Operacional:</Label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_fin_periodo}
                  onChange={(e) => setFormData({ ...formData, fecha_fin_periodo: e.target.value })}
                />
              </div>
            </div>

            {/* Sección 6: Lista de Personal Asignado */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">6. Lista de Personal Asignado:</Label>
                <Button size="sm" variant="outline" onClick={handleAddPersonal}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Personal
                </Button>
              </div>

              <div className="space-y-3">
                {formData.personal_asignado.map((personal, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Personal {index + 1}</span>
                      {formData.personal_asignado.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePersonal(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Nombres y Apellidos:</Label>
                        <Input
                          value={personal.nombre}
                          onChange={(e) => handlePersonalChange(index, 'nombre', e.target.value)}
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Posición en el SCI:</Label>
                        <Input
                          value={personal.posicion}
                          onChange={(e) => handlePersonalChange(index, 'posicion', e.target.value)}
                          placeholder="Ej: Jefe de Operaciones"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Institución a la que pertenece:</Label>
                        <Input
                          value={personal.institucion}
                          onChange={(e) => handlePersonalChange(index, 'institucion', e.target.value)}
                          placeholder="Ej: Bomberos"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección 7: Registro de Actividades */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">7. Registro de Actividades (adicionar páginas numeradas):</Label>
                <Button size="sm" variant="outline" onClick={handleAddActividad}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Actividad
                </Button>
              </div>

              <div className="space-y-3">
                {formData.actividades.map((actividad, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Actividad {index + 1}</span>
                      {formData.actividades.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveActividad(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Hora:</Label>
                        <Input
                          type="time"
                          value={actividad.hora}
                          onChange={(e) => handleActividadChange(index, 'hora', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label className="text-sm">Eventos Principales:</Label>
                        <Textarea
                          value={actividad.eventos}
                          onChange={(e) => handleActividadChange(index, 'eventos', e.target.value)}
                          placeholder="Descripción de los eventos principales"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparado por */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="font-semibold">8. Preparado por (nombres, apellidos, firma y posición):</Label>
              <Input
                value={formData.preparado_por}
                onChange={(e) => setFormData({ ...formData, preparado_por: e.target.value })}
                placeholder="Nombre completo y posición"
              />
            </div>

            <div className="text-center text-xs text-slate-400 pt-4">
              Página 1 de 1
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Guardar Formulario
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}