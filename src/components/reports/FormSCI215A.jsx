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

export default function FormSCI215A({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha: format(new Date(), "dd/MM/yyyy"),
    hora: format(new Date(), "HH:mm"),
    analisis: [
      { area: '', riesgo: '', accion_mitigante: '' }
    ],
    preparado_por: ''
  });

  const handleAddAnalisis = () => {
    setFormData({
      ...formData,
      analisis: [...formData.analisis, { area: '', riesgo: '', accion_mitigante: '' }]
    });
  };

  const handleAnalisisChange = (index, field, value) => {
    const newAnalisis = [...formData.analisis];
    newAnalisis[index][field] = value;
    setFormData({ ...formData, analisis: newAnalisis });
  };

  const handleRemoveAnalisis = (index) => {
    if (formData.analisis.length > 1) {
      const newAnalisis = formData.analisis.filter((_, i) => i !== index);
      setFormData({ ...formData, analisis: newAnalisis });
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
    
    pdf.save(`SCI-215A-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-215A - Análisis de Seguridad</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 215 A</h2>
                <p className="text-lg font-semibold text-slate-700">Análisis de Seguridad del Plan de Acción del Incidente</p>
                <p className="text-xs text-slate-500">SCI 215 a AM - Abril 2009</p>
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
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border-2 border-slate-300">
              <div className="space-y-2">
                <Label className="font-semibold">1. Nombre del incidente:</Label>
                <Input
                  value={formData.nombre_incidente}
                  onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">2. Fecha:</Label>
                <Input
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">3. Hora:</Label>
                <Input
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
            </div>

            {/* Tabla de Análisis */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 pb-2">
                <Label className="font-semibold text-base">Análisis de Seguridad del Plan de Acción del Incidente</Label>
                <Button size="sm" variant="outline" onClick={handleAddAnalisis}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Fila
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 bg-slate-700 text-white p-3 rounded-t-lg font-semibold text-sm">
                <div className="col-span-3">ÁREA</div>
                <div className="col-span-4">RIESGO</div>
                <div className="col-span-5">ACCIÓN MITIGANTE</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-2">
                {formData.analisis.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="grid grid-cols-12 gap-3 border rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="col-span-3">
                        <Textarea
                          value={item.area}
                          onChange={(e) => handleAnalisisChange(index, 'area', e.target.value)}
                          placeholder="Área o zona específica"
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-4">
                        <Textarea
                          value={item.riesgo}
                          onChange={(e) => handleAnalisisChange(index, 'riesgo', e.target.value)}
                          placeholder="Descripción del riesgo identificado"
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-5">
                        <Textarea
                          value={item.accion_mitigante}
                          onChange={(e) => handleAnalisisChange(index, 'accion_mitigante', e.target.value)}
                          placeholder="Acción para mitigar el riesgo"
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    {formData.analisis.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 bg-white border shadow-sm hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveAnalisis(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preparado por */}
            <div className="space-y-2 pt-4 border-t-2">
              <Label className="font-semibold">PREPARADO POR:</Label>
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