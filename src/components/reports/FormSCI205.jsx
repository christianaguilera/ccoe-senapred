import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI205({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    fecha_inicio_periodo: '',
    fecha_fin_periodo: '',
    canales: [
      { sistema_equipo: '', canal: '', asignado_a: '', ubicacion: '', observaciones: '' }
    ],
    preparado_por: '',
  });

  const handleAddCanal = () => {
    setFormData({
      ...formData,
      canales: [...formData.canales, { sistema_equipo: '', canal: '', asignado_a: '', ubicacion: '', observaciones: '' }]
    });
  };

  const handleRemoveCanal = (index) => {
    if (formData.canales.length > 1) {
      const newCanales = formData.canales.filter((_, i) => i !== index);
      setFormData({ ...formData, canales: newCanales });
    }
  };

  const handleCanalChange = (index, field, value) => {
    const newCanales = [...formData.canales];
    newCanales[index][field] = value;
    setFormData({ ...formData, canales: newCanales });
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
    pdf.save(`SCI-205-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-205-Plan de Comunicaciones</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 205</h2>
                <p className="text-lg font-semibold text-slate-700">Plan de Comunicaciones</p>
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
                <Label className="font-semibold">4. Fecha y hora de Inicio del periodo operacional:</Label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_inicio_periodo}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_periodo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">5. Fecha y hora de finalización del periodo operacional:</Label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_fin_periodo}
                  onChange={(e) => setFormData({ ...formData, fecha_fin_periodo: e.target.value })}
                />
              </div>
            </div>

            {/* Distribución de Canales de Comunicación */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-base">Distribución de Canales de Comunicación</Label>
                <Button size="sm" onClick={handleAddCanal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Canal
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left text-sm font-semibold">
                        6. Sistema/Equipo
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-sm font-semibold">
                        7. Canal
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-sm font-semibold">
                        8. Asignado a
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-sm font-semibold">
                        9. Ubicación
                      </th>
                      <th className="border border-slate-300 p-2 text-left text-sm font-semibold">
                        10. Observaciones
                      </th>
                      <th className="border border-slate-300 p-2 text-center text-sm font-semibold w-12">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.canales.map((canal, index) => (
                      <tr key={index}>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={canal.sistema_equipo}
                            onChange={(e) => handleCanalChange(index, 'sistema_equipo', e.target.value)}
                            placeholder="Ej: Radio VHF"
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={canal.canal}
                            onChange={(e) => handleCanalChange(index, 'canal', e.target.value)}
                            placeholder="Ej: Canal 5"
                            className="min-w-[100px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={canal.asignado_a}
                            onChange={(e) => handleCanalChange(index, 'asignado_a', e.target.value)}
                            placeholder="Nombre/Unidad"
                            className="min-w-[150px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={canal.ubicacion}
                            onChange={(e) => handleCanalChange(index, 'ubicacion', e.target.value)}
                            placeholder="Ubicación"
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Input
                            value={canal.observaciones}
                            onChange={(e) => handleCanalChange(index, 'observaciones', e.target.value)}
                            placeholder="Observaciones"
                            className="min-w-[150px]"
                          />
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {formData.canales.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCanal(index)}
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

            {/* Footer - Preparado por */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="font-semibold">11. Preparado por el Líder de la Unidad de Comunicaciones (LUCO):</Label>
              <Input
                value={formData.preparado_por}
                onChange={(e) => setFormData({ ...formData, preparado_por: e.target.value })}
                placeholder="Nombre del Líder de la Unidad de Comunicaciones"
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