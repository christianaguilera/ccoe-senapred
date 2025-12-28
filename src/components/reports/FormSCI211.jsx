import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI211({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    lugar_registro: '',
    registrador1: '',
    registrador2: '',
    registrador3: '',
    recursos: [
      { 
        solicitado_por: '',
        fecha_solicitud: '',
        clase: '',
        tipo: '',
        fecha_arribo: '',
        institucion: '',
        matricula: '',
        num_personas: '',
        disponible: true,
        asignado_a: '',
        desmovilizado_por: '',
        fecha_desmovilizacion: '',
        observaciones: ''
      }
    ]
  });

  const handleAddRecurso = () => {
    setFormData({
      ...formData,
      recursos: [
        ...formData.recursos,
        { 
          solicitado_por: '',
          fecha_solicitud: '',
          clase: '',
          tipo: '',
          fecha_arribo: '',
          institucion: '',
          matricula: '',
          num_personas: '',
          disponible: true,
          asignado_a: '',
          desmovilizado_por: '',
          fecha_desmovilizacion: '',
          observaciones: ''
        }
      ]
    });
  };

  const handleRecursoChange = (index, field, value) => {
    const newRecursos = [...formData.recursos];
    newRecursos[index][field] = value;
    setFormData({ ...formData, recursos: newRecursos });
  };

  const handleRemoveRecurso = (index) => {
    if (formData.recursos.length > 1) {
      const newRecursos = formData.recursos.filter((_, i) => i !== index);
      setFormData({ ...formData, recursos: newRecursos });
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
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SCI-211-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-211 - Registro y Control de Recursos</DialogTitle>
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
          <div className="text-center border-b-2 border-orange-500 pb-4">
            <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 211</h2>
            <p className="text-lg font-semibold text-slate-700">Registro y Control de Recursos</p>
            <p className="text-xs text-slate-500">Rev. 06 - 2015</p>
          </div>

          <Card className="p-6 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Nombre del Incidente:</Label>
                  <Input
                    value={formData.nombre_incidente}
                    onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Fecha y hora de preparación:</Label>
                  <Input
                    value={formData.fecha_preparacion}
                    onChange={(e) => setFormData({ ...formData, fecha_preparacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Lugar de Registro:</Label>
                <Input
                  value={formData.lugar_registro}
                  onChange={(e) => setFormData({ ...formData, lugar_registro: e.target.value })}
                  placeholder="Ubicación del registro"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Nombre del Registrador 1:</Label>
                  <Input
                    value={formData.registrador1}
                    onChange={(e) => setFormData({ ...formData, registrador1: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Nombre del Registrador 2:</Label>
                  <Input
                    value={formData.registrador2}
                    onChange={(e) => setFormData({ ...formData, registrador2: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Nombre del Registrador 3:</Label>
                  <Input
                    value={formData.registrador3}
                    onChange={(e) => setFormData({ ...formData, registrador3: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de recursos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">Registro de Recursos</Label>
                <Button size="sm" variant="outline" onClick={handleAddRecurso}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Recurso
                </Button>
              </div>

              <div className="space-y-3">
                {formData.recursos.map((recurso, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Recurso {index + 1}</span>
                      {formData.recursos.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecurso(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Sección A: Solicitud de Recurso */}
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2">A. SOLICITUD DE RECURSO</p>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">1. Por quién?</Label>
                            <Input
                              value={recurso.solicitado_por}
                              onChange={(e) => handleRecursoChange(index, 'solicitado_por', e.target.value)}
                              placeholder="Nombre"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">2. Fecha y hora:</Label>
                            <Input
                              type="datetime-local"
                              value={recurso.fecha_solicitud}
                              onChange={(e) => handleRecursoChange(index, 'fecha_solicitud', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">3. Clase:</Label>
                            <Input
                              value={recurso.clase}
                              onChange={(e) => handleRecursoChange(index, 'clase', e.target.value)}
                              placeholder="Clase"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">4. Tipo:</Label>
                            <Input
                              value={recurso.tipo}
                              onChange={(e) => handleRecursoChange(index, 'tipo', e.target.value)}
                              placeholder="Tipo"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sección B: Arribo Real */}
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="text-xs font-semibold text-green-700 mb-2">B. ARRIBO REAL</p>
                        <div className="space-y-2">
                          <Label className="text-xs">5. Fecha y hora:</Label>
                          <Input
                            type="datetime-local"
                            value={recurso.fecha_arribo}
                            onChange={(e) => handleRecursoChange(index, 'fecha_arribo', e.target.value)}
                            className="h-9 text-sm max-w-xs"
                          />
                        </div>
                      </div>

                      {/* Sección C: Suministrado Por */}
                      <div className="border-l-4 border-purple-500 pl-3">
                        <p className="text-xs font-semibold text-purple-700 mb-2">C. SUMINISTRADO POR</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">6. Institución:</Label>
                            <Input
                              value={recurso.institucion}
                              onChange={(e) => handleRecursoChange(index, 'institucion', e.target.value)}
                              placeholder="Nombre institución"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">7. Matrícula:</Label>
                            <Input
                              value={recurso.matricula}
                              onChange={(e) => handleRecursoChange(index, 'matricula', e.target.value)}
                              placeholder="Matrícula/Placa"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">8. Número de personas:</Label>
                            <Input
                              type="number"
                              value={recurso.num_personas}
                              onChange={(e) => handleRecursoChange(index, 'num_personas', e.target.value)}
                              placeholder="0"
                              min="0"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sección D: Estado de los Recursos */}
                      <div className="border-l-4 border-amber-500 pl-3">
                        <p className="text-xs font-semibold text-amber-700 mb-2">D. ESTADO DE LOS RECURSOS</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Estado:</Label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={recurso.disponible === true}
                                  onChange={() => handleRecursoChange(index, 'disponible', true)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">Disponible</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={recurso.disponible === false}
                                  onChange={() => handleRecursoChange(index, 'disponible', false)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">No Disponible</span>
                              </label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Asignado a:</Label>
                            <Input
                              value={recurso.asignado_a}
                              onChange={(e) => handleRecursoChange(index, 'asignado_a', e.target.value)}
                              placeholder="División/Unidad"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sección E: Desmovilizado */}
                      <div className="border-l-4 border-red-500 pl-3">
                        <p className="text-xs font-semibold text-red-700 mb-2">E. DESMOVILIZADO</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">10. Por quién:</Label>
                            <Input
                              value={recurso.desmovilizado_por}
                              onChange={(e) => handleRecursoChange(index, 'desmovilizado_por', e.target.value)}
                              placeholder="Nombre"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">11. Fecha y hora:</Label>
                            <Input
                              type="datetime-local"
                              value={recurso.fecha_desmovilizacion}
                              onChange={(e) => handleRecursoChange(index, 'fecha_desmovilizacion', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Observaciones */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">12. OBSERVACIONES:</Label>
                        <Textarea
                          value={recurso.observaciones}
                          onChange={(e) => handleRecursoChange(index, 'observaciones', e.target.value)}
                          placeholder="Observaciones adicionales..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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