import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI207({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    lugar_registro: 'ACV', // 'ACV' o 'Unidad Médica'
    responsable: '',
    victimas: [
      { 
        nombre: '', 
        sexo: '', 
        edad: '', 
        clasificacion: { rojo: false, amarillo: false, verde: false, negro: false },
        lugar_traslado: '', 
        trasladado_por: '', 
        fecha_hora: '' 
      }
    ]
  });

  const handleAddVictima = () => {
    setFormData({
      ...formData,
      victimas: [
        ...formData.victimas,
        { 
          nombre: '', 
          sexo: '', 
          edad: '', 
          clasificacion: { rojo: false, amarillo: false, verde: false, negro: false },
          lugar_traslado: '', 
          trasladado_por: '', 
          fecha_hora: '' 
        }
      ]
    });
  };

  const handleVictimaChange = (index, field, value) => {
    const newVictimas = [...formData.victimas];
    if (field === 'clasificacion') {
      newVictimas[index].clasificacion = value;
    } else {
      newVictimas[index][field] = value;
    }
    setFormData({ ...formData, victimas: newVictimas });
  };

  const handleRemoveVictima = (index) => {
    if (formData.victimas.length > 1) {
      const newVictimas = formData.victimas.filter((_, i) => i !== index);
      setFormData({ ...formData, victimas: newVictimas });
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
    pdf.save(`SCI-207-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-207 - Registro de Víctimas</DialogTitle>
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
            <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 207</h2>
            <p className="text-lg font-semibold text-slate-700">Registro de Víctimas</p>
            <p className="text-xs text-slate-500">Rev. 06 - 2015</p>
          </div>

          <Card className="p-6 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">1. Nombre del Incidente:</Label>
                <Input
                  value={formData.nombre_incidente}
                  onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">2. Lugar de Registro:</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="lugar_registro"
                        checked={formData.lugar_registro === 'ACV'}
                        onChange={() => setFormData({ ...formData, lugar_registro: 'ACV' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">ACV</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="lugar_registro"
                        checked={formData.lugar_registro === 'Unidad Médica'}
                        onChange={() => setFormData({ ...formData, lugar_registro: 'Unidad Médica' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Unidad Médica</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">3. Nombres del Responsable de la Posición:</Label>
                  <Input
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>
            </div>

            {/* Tabla de víctimas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-semibold text-base">Registro de Víctimas</Label>
                <Button size="sm" variant="outline" onClick={handleAddVictima}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Víctima
                </Button>
              </div>

              <div className="space-y-3">
                {formData.victimas.map((victima, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-700">Víctima {index + 1}</span>
                      {formData.victimas.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVictima(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Fila 1: Nombre, Sexo, Edad */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2 col-span-2">
                          <Label className="text-sm">4. Nombres del paciente:</Label>
                          <Input
                            value={victima.nombre}
                            onChange={(e) => handleVictimaChange(index, 'nombre', e.target.value)}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">5. Sexo:</Label>
                          <select
                            value={victima.sexo}
                            onChange={(e) => handleVictimaChange(index, 'sexo', e.target.value)}
                            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                          >
                            <option value="">Seleccionar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                          </select>
                        </div>
                      </div>

                      {/* Fila 2: Edad y Clasificación */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">6. Edad:</Label>
                          <Input
                            type="number"
                            value={victima.edad}
                            onChange={(e) => handleVictimaChange(index, 'edad', e.target.value)}
                            placeholder="Edad"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">7. Clasificación:</Label>
                          <div className="flex gap-4 items-center h-10">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={victima.clasificacion.rojo}
                                onChange={(e) => handleVictimaChange(index, 'clasificacion', {
                                  ...victima.clasificacion,
                                  rojo: e.target.checked
                                })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-red-600 font-medium">Rojo</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={victima.clasificacion.amarillo}
                                onChange={(e) => handleVictimaChange(index, 'clasificacion', {
                                  ...victima.clasificacion,
                                  amarillo: e.target.checked
                                })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-yellow-600 font-medium">Amarillo</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={victima.clasificacion.verde}
                                onChange={(e) => handleVictimaChange(index, 'clasificacion', {
                                  ...victima.clasificacion,
                                  verde: e.target.checked
                                })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-green-600 font-medium">Verde</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={victima.clasificacion.negro}
                                onChange={(e) => handleVictimaChange(index, 'clasificacion', {
                                  ...victima.clasificacion,
                                  negro: e.target.checked
                                })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-slate-700 font-medium">Negro</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Fila 3: Traslado */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">8. Lugar de Traslado:</Label>
                          <Input
                            value={victima.lugar_traslado}
                            onChange={(e) => handleVictimaChange(index, 'lugar_traslado', e.target.value)}
                            placeholder="Hospital o centro médico"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">9. Trasladado por:</Label>
                          <Input
                            value={victima.trasladado_por}
                            onChange={(e) => handleVictimaChange(index, 'trasladado_por', e.target.value)}
                            placeholder="Ambulancia, helicóptero, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">10. Fecha y hora:</Label>
                          <Input
                            type="datetime-local"
                            value={victima.fecha_hora}
                            onChange={(e) => handleVictimaChange(index, 'fecha_hora', e.target.value)}
                          />
                        </div>
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