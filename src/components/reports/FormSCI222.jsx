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

export default function FormSCI222({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    identificacion_comando: '',
    fecha_hora: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    recursos_criticos: ['Recurso 1', 'Recurso 2', 'Recurso 3', 'Recurso 4', 'Recurso 5'],
    incidentes: [
      { nombre: incident?.name || '', prioridad: '', requiere: {}, tiene: {}, falta: {} }
    ],
    observaciones: '',
    preparado_por: ''
  });

  const handleAddIncidente = () => {
    const newIncidente = { 
      nombre: '', 
      prioridad: '', 
      requiere: {}, 
      tiene: {}, 
      falta: {} 
    };
    setFormData({
      ...formData,
      incidentes: [...formData.incidentes, newIncidente]
    });
  };

  const handleRemoveIncidente = (index) => {
    if (formData.incidentes.length > 1) {
      const newIncidentes = formData.incidentes.filter((_, i) => i !== index);
      setFormData({ ...formData, incidentes: newIncidentes });
    }
  };

  const handleIncidenteChange = (index, field, value) => {
    const newIncidentes = [...formData.incidentes];
    newIncidentes[index][field] = value;
    setFormData({ ...formData, incidentes: newIncidentes });
  };

  const handleRecursoChange = (incidenteIdx, recurso, field, value) => {
    const newIncidentes = [...formData.incidentes];
    if (!newIncidentes[incidenteIdx][field]) {
      newIncidentes[incidenteIdx][field] = {};
    }
    newIncidentes[incidenteIdx][field][recurso] = value;
    setFormData({ ...formData, incidentes: newIncidentes });
  };

  const handleAddRecurso = () => {
    const newRecurso = `Recurso ${formData.recursos_criticos.length + 1}`;
    setFormData({
      ...formData,
      recursos_criticos: [...formData.recursos_criticos, newRecurso]
    });
  };

  const handleRemoveRecurso = (index) => {
    if (formData.recursos_criticos.length > 1) {
      const newRecursos = formData.recursos_criticos.filter((_, i) => i !== index);
      setFormData({ ...formData, recursos_criticos: newRecursos });
    }
  };

  const handleRecursoNameChange = (index, value) => {
    const newRecursos = [...formData.recursos_criticos];
    newRecursos[index] = value;
    setFormData({ ...formData, recursos_criticos: newRecursos });
  };

  const calculateTotals = (field) => {
    let total = 0;
    formData.incidentes.forEach(inc => {
      formData.recursos_criticos.forEach(rec => {
        const val = parseInt(inc[field]?.[rec] || 0);
        total += val;
      });
    });
    return total;
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
    const pdf = new jsPDF('l', 'mm', 'a4');
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
    
    pdf.save(`SCI-222-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-222 - Prioridades y Asignación de Recursos</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 222</h2>
                <p className="text-lg font-semibold text-slate-700">Prioridades y Asignación de Recursos</p>
                <p className="text-xs text-slate-500">Comando de Área - Versión 2018</p>
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
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label className="font-semibold">1. Identificación Comando de Área</Label>
                <Input
                  value={formData.identificacion_comando}
                  onChange={(e) => setFormData({ ...formData, identificacion_comando: e.target.value })}
                  placeholder="Identificación del comando"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">2. Fecha y hora de preparación</Label>
                <Input
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">3. Periodo operacional (fecha y hora)</Label>
                <Input
                  type="datetime-local"
                  value={formData.periodo_operacional}
                  onChange={(e) => setFormData({ ...formData, periodo_operacional: e.target.value })}
                />
              </div>
            </div>

            {/* Recursos Críticos - Header editable */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 pb-2">
                <Label className="font-semibold text-base">6. Recursos Críticos</Label>
                <Button size="sm" variant="outline" onClick={handleAddRecurso}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Recurso
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {formData.recursos_criticos.map((recurso, idx) => (
                  <div key={idx} className="relative">
                    <Input
                      value={recurso}
                      onChange={(e) => handleRecursoNameChange(idx, e.target.value)}
                      className="w-32 text-sm"
                      placeholder={`Recurso ${idx + 1}`}
                    />
                    {formData.recursos_criticos.length > 1 && (
                      <button
                        onClick={() => handleRemoveRecurso(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla de Incidentes y Recursos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 pb-2">
                <Label className="font-semibold text-base">4. Prioridad Incidente / 5. Incidentes</Label>
                <Button size="sm" variant="outline" onClick={handleAddIncidente}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Incidente
                </Button>
              </div>

              <div className="overflow-x-auto">
                <div className="space-y-3">
                  {formData.incidentes.map((incidente, incIdx) => (
                    <div key={incIdx} className="border-2 rounded-lg p-4 bg-slate-50 relative">
                      {formData.incidentes.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveIncidente(incIdx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Incidente Header */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Nombre del Incidente</Label>
                          <Input
                            value={incidente.nombre}
                            onChange={(e) => handleIncidenteChange(incIdx, 'nombre', e.target.value)}
                            placeholder="Nombre del incidente"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Prioridad</Label>
                          <Input
                            value={incidente.prioridad}
                            onChange={(e) => handleIncidenteChange(incIdx, 'prioridad', e.target.value)}
                            placeholder="Ej: Alta, Media, Baja"
                          />
                        </div>
                      </div>

                      {/* Recursos Table */}
                      <div className="space-y-2">
                        <div className="grid gap-2" style={{ gridTemplateColumns: `200px repeat(${formData.recursos_criticos.length}, 1fr)` }}>
                          {/* Header Row */}
                          <div className="font-semibold text-sm bg-slate-200 p-2 rounded"></div>
                          {formData.recursos_criticos.map((recurso, rIdx) => (
                            <div key={rIdx} className="font-semibold text-xs bg-slate-700 text-white p-2 rounded text-center">
                              {recurso}
                            </div>
                          ))}

                          {/* Requiere Row */}
                          <div className="font-semibold text-sm bg-blue-100 p-2 rounded">Requiere</div>
                          {formData.recursos_criticos.map((recurso, rIdx) => (
                            <Input
                              key={rIdx}
                              type="number"
                              value={incidente.requiere?.[recurso] || ''}
                              onChange={(e) => handleRecursoChange(incIdx, recurso, 'requiere', e.target.value)}
                              className="text-sm h-9"
                              placeholder="0"
                            />
                          ))}

                          {/* Tiene Row */}
                          <div className="font-semibold text-sm bg-green-100 p-2 rounded">Tiene</div>
                          {formData.recursos_criticos.map((recurso, rIdx) => (
                            <Input
                              key={rIdx}
                              type="number"
                              value={incidente.tiene?.[recurso] || ''}
                              onChange={(e) => handleRecursoChange(incIdx, recurso, 'tiene', e.target.value)}
                              className="text-sm h-9"
                              placeholder="0"
                            />
                          ))}

                          {/* Falta Row */}
                          <div className="font-semibold text-sm bg-red-100 p-2 rounded">Falta</div>
                          {formData.recursos_criticos.map((recurso, rIdx) => (
                            <Input
                              key={rIdx}
                              type="number"
                              value={incidente.falta?.[recurso] || ''}
                              onChange={(e) => handleRecursoChange(incIdx, recurso, 'falta', e.target.value)}
                              className="text-sm h-9"
                              placeholder="0"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totales */}
            <div className="grid grid-cols-3 gap-4 bg-slate-100 p-4 rounded-lg border-2 border-slate-300">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">8. Total recursos requeridos</Label>
                <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded text-center font-bold text-lg">
                  {calculateTotals('requiere')}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">9. Total recursos existentes</Label>
                <div className="bg-green-50 border-2 border-green-300 p-3 rounded text-center font-bold text-lg">
                  {calculateTotals('tiene')}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">10. Total recursos faltantes</Label>
                <div className="bg-red-50 border-2 border-red-300 p-3 rounded text-center font-bold text-lg">
                  {calculateTotals('falta')}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label className="font-semibold">7. Observaciones</Label>
              <Textarea
                rows={4}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Preparado por */}
            <div className="space-y-2 pt-4 border-t-2">
              <Label className="font-semibold">11. Preparado por (nombre y posición)</Label>
              <Input
                value={formData.preparado_por}
                onChange={(e) => setFormData({ ...formData, preparado_por: e.target.value })}
                placeholder="Nombre y cargo"
              />
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