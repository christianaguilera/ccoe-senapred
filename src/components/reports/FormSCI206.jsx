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

export default function FormSCI206({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    fecha_inicio_periodo: '',
    fecha_fin_periodo: '',
    instalacion_medica: '',
    ubicacion_instalacion: '',
    asistencia_medica: [
      { institucion: '', ubicacion: '', contacto: '' }
    ],
    ambulancias: [
      { clase_tipo: '', institucion: '', observaciones: '' }
    ],
    derivaciones: [
      { rojo: false, amarillo: false, verde: false, institucion: '', ambulancia: false, aereo: false, otro: false }
    ],
    lider_unidad_medica: ''
  });

  const handleAddAsistencia = () => {
    setFormData({
      ...formData,
      asistencia_medica: [...formData.asistencia_medica, { institucion: '', ubicacion: '', contacto: '' }]
    });
  };

  const handleAsistenciaChange = (index, field, value) => {
    const newAsistencias = [...formData.asistencia_medica];
    newAsistencias[index][field] = value;
    setFormData({ ...formData, asistencia_medica: newAsistencias });
  };

  const handleRemoveAsistencia = (index) => {
    if (formData.asistencia_medica.length > 1) {
      const newAsistencias = formData.asistencia_medica.filter((_, i) => i !== index);
      setFormData({ ...formData, asistencia_medica: newAsistencias });
    }
  };

  const handleAddAmbulancia = () => {
    setFormData({
      ...formData,
      ambulancias: [...formData.ambulancias, { clase_tipo: '', institucion: '', observaciones: '' }]
    });
  };

  const handleAmbulanciaChange = (index, field, value) => {
    const newAmbulancias = [...formData.ambulancias];
    newAmbulancias[index][field] = value;
    setFormData({ ...formData, ambulancias: newAmbulancias });
  };

  const handleRemoveAmbulancia = (index) => {
    if (formData.ambulancias.length > 1) {
      const newAmbulancias = formData.ambulancias.filter((_, i) => i !== index);
      setFormData({ ...formData, ambulancias: newAmbulancias });
    }
  };

  const handleAddDerivacion = () => {
    setFormData({
      ...formData,
      derivaciones: [...formData.derivaciones, { rojo: false, amarillo: false, verde: false, institucion: '', ambulancia: false, aereo: false, otro: false }]
    });
  };

  const handleDerivacionChange = (index, field, value) => {
    const newDerivaciones = [...formData.derivaciones];
    newDerivaciones[index][field] = value;
    setFormData({ ...formData, derivaciones: newDerivaciones });
  };

  const handleRemoveDerivacion = (index) => {
    if (formData.derivaciones.length > 1) {
      const newDerivaciones = formData.derivaciones.filter((_, i) => i !== index);
      setFormData({ ...formData, derivaciones: newDerivaciones });
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
    pdf.save(`SCI-206-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-206 - Plan Médico</DialogTitle>
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
            <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 206</h2>
            <p className="text-lg font-semibold text-slate-700">Plan Médico</p>
            <p className="text-xs text-slate-500">Rev. 06 - 2015</p>
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
                <Label className="font-semibold">4. Fecha y hora de inicio del Periodo Operacional:</Label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_inicio_periodo}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_periodo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">5. Fecha y hora de finalización del Periodo Operacional:</Label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_fin_periodo}
                  onChange={(e) => setFormData({ ...formData, fecha_fin_periodo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">6. Nombre de la instalación de asistencia médica:</Label>
                <Input
                  value={formData.instalacion_medica}
                  onChange={(e) => setFormData({ ...formData, instalacion_medica: e.target.value })}
                  placeholder="Nombre de la instalación"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">7. Ubicación:</Label>
                <Input
                  value={formData.ubicacion_instalacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion_instalacion: e.target.value })}
                  placeholder="Ubicación de la instalación"
                />
              </div>
            </div>

            {/* Sección A: Asistencia Médica */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">A. Asistencia Médica</Label>
                <Button size="sm" variant="outline" onClick={handleAddAsistencia}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {formData.asistencia_medica.map((asistencia, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Institución {index + 1}</span>
                      {formData.asistencia_medica.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAsistencia(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">7. Nombre de la Institución:</Label>
                        <Input
                          value={asistencia.institucion}
                          onChange={(e) => handleAsistenciaChange(index, 'institucion', e.target.value)}
                          placeholder="Nombre institución"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">9. Ubicación:</Label>
                        <Input
                          value={asistencia.ubicacion}
                          onChange={(e) => handleAsistenciaChange(index, 'ubicacion', e.target.value)}
                          placeholder="Ubicación"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">10. Forma de contacto:</Label>
                        <Input
                          value={asistencia.contacto}
                          onChange={(e) => handleAsistenciaChange(index, 'contacto', e.target.value)}
                          placeholder="Teléfono, email, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección B: Servicios de Ambulancia */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">B. Servicios de Ambulancia Requerido</Label>
                <Button size="sm" variant="outline" onClick={handleAddAmbulancia}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {formData.ambulancias.map((ambulancia, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Ambulancia {index + 1}</span>
                      {formData.ambulancias.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAmbulancia(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">11. Clase y Tipo:</Label>
                        <Input
                          value={ambulancia.clase_tipo}
                          onChange={(e) => handleAmbulanciaChange(index, 'clase_tipo', e.target.value)}
                          placeholder="Ej: Básica, Avanzada"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">12. Institución:</Label>
                        <Input
                          value={ambulancia.institucion}
                          onChange={(e) => handleAmbulanciaChange(index, 'institucion', e.target.value)}
                          placeholder="Institución"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">13. Observaciones:</Label>
                        <Input
                          value={ambulancia.observaciones}
                          onChange={(e) => handleAmbulanciaChange(index, 'observaciones', e.target.value)}
                          placeholder="Observaciones"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección C: Derivación de Pacientes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">C. Derivación de Pacientes</Label>
                <Button size="sm" variant="outline" onClick={handleAddDerivacion}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {formData.derivaciones.map((derivacion, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Derivación {index + 1}</span>
                      {formData.derivaciones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDerivacion(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">14. Clasificación de Pacientes:</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={derivacion.rojo}
                              onChange={(e) => handleDerivacionChange(index, 'rojo', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-red-600 font-medium">Rojo</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={derivacion.amarillo}
                              onChange={(e) => handleDerivacionChange(index, 'amarillo', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-yellow-600 font-medium">Amarillo</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={derivacion.verde}
                              onChange={(e) => handleDerivacionChange(index, 'verde', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-green-600 font-medium">Verde</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">15. Institución de Asistencia Médica - Nombre:</Label>
                        <Input
                          value={derivacion.institucion}
                          onChange={(e) => handleDerivacionChange(index, 'institucion', e.target.value)}
                          placeholder="Nombre de la institución"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">16. Medio de transporte:</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={derivacion.ambulancia}
                              onChange={(e) => handleDerivacionChange(index, 'ambulancia', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Ambulancia</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={derivacion.aereo}
                              onChange={(e) => handleDerivacionChange(index, 'aereo', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Aéreo</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={derivacion.otro}
                              onChange={(e) => handleDerivacionChange(index, 'otro', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Otro</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparado por */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="font-semibold">17. Preparado por Líder Unidad Médica:</Label>
              <Input
                value={formData.lider_unidad_medica}
                onChange={(e) => setFormData({ ...formData, lider_unidad_medica: e.target.value })}
                placeholder="Nombre del Líder Unidad Médica"
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