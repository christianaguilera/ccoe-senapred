import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI204({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    fecha_inicio_periodo: '',
    fecha_fin_periodo: '',
    // Posición en la Sección de Operaciones
    posicion: '',
    posicion_nombre_especifico: '',
    // Recursos Asignados
    recursos: [
      { nombre_responsable: '', funcion: '', asignacion_tactica: '', ubicacion: '', num_personas: '', observaciones: '' }
    ],
    // Footer
    preparado_fecha_hora: format(new Date(), "dd/MM/yyyy HH:mm"),
    preparado_por: '',
    aprobado_fecha_hora: '',
    aprobado_por: '',
  });

  const posicionOptions = [
    { value: 'jefe_seccion', label: 'Jefe de la Sección' },
    { value: 'coordinador_rama', label: 'Coordinador de Rama' },
    { value: 'supervisor_division', label: 'Supervisor de División' },
    { value: 'supervisor_grupo', label: 'Supervisor de Grupo' },
    { value: 'lider_fuerza_tarea', label: 'Líder Fuerza de Tarea' },
    { value: 'lider_equipo_intervencion', label: 'Líder Equipo de Intervención' },
    { value: 'lider_recurso_simple', label: 'Líder Recurso Simple' },
    { value: 'encargado', label: 'Encargado' },
    { value: 'otro', label: 'Nombre específico' },
  ];

  const handleAddRecurso = () => {
    setFormData({
      ...formData,
      recursos: [...formData.recursos, { nombre_responsable: '', funcion: '', asignacion_tactica: '', ubicacion: '', num_personas: '', observaciones: '' }]
    });
  };

  const handleRemoveRecurso = (index) => {
    if (formData.recursos.length > 1) {
      const newRecursos = formData.recursos.filter((_, i) => i !== index);
      setFormData({ ...formData, recursos: newRecursos });
    }
  };

  const handleRecursoChange = (index, field, value) => {
    const newRecursos = [...formData.recursos];
    newRecursos[index][field] = value;
    setFormData({ ...formData, recursos: newRecursos });
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
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(`SCI-204-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-204-Asignaciones Tácticas</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 204</h2>
                <p className="text-lg font-semibold text-slate-700">Asignaciones Tácticas</p>
                <p className="text-xs text-slate-500">Rev. 06 - 2015</p>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/93620ed88_LogoSENAPRED.png" 
                alt="Logo SENAPRED"
                className="w-24 h-16 object-contain"
              />
            </div>
          </div>

          <Card className="p-6">
            {/* Información General */}
            <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b">
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

            <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
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

            {/* Posición en la Sección de Operaciones */}
            <div className="space-y-4 mb-6 pb-4 border-b bg-slate-50 p-4 rounded-lg">
              <Label className="font-semibold text-base">6. Posición en la Sección de Operaciones:</Label>
              <div className="grid grid-cols-2 gap-4">
                {posicionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.posicion === option.value}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, posicion: option.value });
                        }
                      }}
                    />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              
              {formData.posicion === 'otro' && (
                <div className="space-y-2 mt-4">
                  <Label className="text-sm">Nombre específico:</Label>
                  <Input
                    value={formData.posicion_nombre_especifico}
                    onChange={(e) => setFormData({ ...formData, posicion_nombre_especifico: e.target.value })}
                    placeholder="Especifique el nombre de la posición"
                  />
                </div>
              )}
            </div>

            {/* Recursos Asignados */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-base">7. Recursos Asignados</Label>
                <Button size="sm" onClick={handleAddRecurso}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Recurso
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left text-xs font-semibold">
                        Nombre del responsable bajo su cargo
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-xs font-semibold">
                        Función a desempeñar
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-xs font-semibold">
                        Asignación Táctica
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-xs font-semibold">
                        Ubicación
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-xs font-semibold">
                        No. Personas a cargo
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-xs font-semibold">
                        Observaciones
                      </th>
                      <th className="border border-slate-300 p-2 text-center text-xs font-semibold w-12">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.recursos.map((recurso, index) => (
                      <tr key={index}>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={recurso.nombre_responsable}
                            onChange={(e) => handleRecursoChange(index, 'nombre_responsable', e.target.value)}
                            className="min-w-[150px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={recurso.funcion}
                            onChange={(e) => handleRecursoChange(index, 'funcion', e.target.value)}
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={recurso.asignacion_tactica}
                            onChange={(e) => handleRecursoChange(index, 'asignacion_tactica', e.target.value)}
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={recurso.ubicacion}
                            onChange={(e) => handleRecursoChange(index, 'ubicacion', e.target.value)}
                            className="min-w-[100px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            type="number"
                            value={recurso.num_personas}
                            onChange={(e) => handleRecursoChange(index, 'num_personas', e.target.value)}
                            className="min-w-[80px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={recurso.observaciones}
                            onChange={(e) => handleRecursoChange(index, 'observaciones', e.target.value)}
                            className="min-w-[150px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {formData.recursos.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRecurso(index)}
                              className="h-8 w-8"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer - Preparado y Aprobado */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-4">
                <Label className="font-semibold">8. Fecha / Hora:</Label>
                <Input
                  value={formData.preparado_fecha_hora}
                  onChange={(e) => setFormData({ ...formData, preparado_fecha_hora: e.target.value })}
                />
                <Label className="font-semibold">Preparado por:</Label>
                <Input
                  value={formData.preparado_por}
                  onChange={(e) => setFormData({ ...formData, preparado_por: e.target.value })}
                  placeholder="Nombre de quien prepara"
                />
              </div>
              <div className="space-y-4">
                <Label className="font-semibold">9. Aprobado por Jefe Sección de Operaciones:</Label>
                <Input
                  value={formData.aprobado_por}
                  onChange={(e) => setFormData({ ...formData, aprobado_por: e.target.value })}
                  placeholder="Nombre del Jefe de Operaciones"
                />
                <Label className="font-semibold">Fecha / Hora:</Label>
                <Input
                  value={formData.aprobado_fecha_hora}
                  onChange={(e) => setFormData({ ...formData, aprobado_fecha_hora: e.target.value })}
                />
              </div>
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