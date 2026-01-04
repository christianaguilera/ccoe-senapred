import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Printer, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DrawableCanvas from './DrawableCanvas';

export default function FormSCI201({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    lugar_incidente: incident?.location || '',
    evaluacion_naturaleza: '',
    evaluacion_amenazas: '',
    evaluacion_areas: '',
    evaluacion_aislamiento: '',
    objetivos_iniciales: '',
    estrategias: '',
    tacticas: '',
    ubicacion_pc: '',
    ubicacion_e: '',
    ruta_ingreso: '',
    ruta_egreso: '',
    mensaje_seguridad: '',
    comandante: incident?.incident_commander || '',
    acciones: [{ fecha_hora: '', resumen: '' }],
    mapa_situacional: '',
  });

  const handleAddAccion = () => {
    setFormData({
      ...formData,
      acciones: [...formData.acciones, { fecha_hora: '', resumen: '' }]
    });
  };

  const handleAccionChange = (index, field, value) => {
    const newAcciones = [...formData.acciones];
    newAcciones[index][field] = value;
    setFormData({ ...formData, acciones: newAcciones });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const images = formRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const pages = formRef.current.querySelectorAll('[role="tabpanel"]');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const originalDisplay = page.style.display;
        page.style.display = 'block';
        page.setAttribute('data-state', 'active');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight
        });
        
        page.style.display = originalDisplay;
        if (i !== 0) page.setAttribute('data-state', 'inactive');
        
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
      }
      
      pdf.save(`SCI-201-${incident?.incident_number || 'formulario'}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-201-Resumen del Incidente</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 201</h2>
                <p className="text-lg font-semibold text-slate-700">Resumen del Incidente</p>
                <p className="text-xs text-slate-500">Rev. 06 - 2015</p>
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/93620ed88_LogoSENAPRED.png" 
                alt="Logo SENAPRED"
                className="w-24 h-16 object-contain"
              />
            </div>
          </div>

          <Tabs defaultValue="page1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="page1">Página 1</TabsTrigger>
              <TabsTrigger value="page2">Página 2</TabsTrigger>
              <TabsTrigger value="page3">Página 3</TabsTrigger>
              <TabsTrigger value="page4">Página 4</TabsTrigger>
            </TabsList>

            {/* Página 1 */}
            <TabsContent value="page1" className="space-y-4">
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                </div>

                <div className="space-y-2 mb-4">
                  <Label className="font-semibold">3. Lugar del Incidente:</Label>
                  <Input
                    value={formData.lugar_incidente}
                    onChange={(e) => setFormData({ ...formData, lugar_incidente: e.target.value })}
                  />
                </div>

                <div className="space-y-4 mb-4 border rounded-lg p-4 bg-slate-50">
                  <Label className="font-semibold text-base">4. Evaluación Inicial:</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">- Naturaleza del incidente:</Label>
                    <Textarea
                      rows={3}
                      value={formData.evaluacion_naturaleza}
                      onChange={(e) => setFormData({ ...formData, evaluacion_naturaleza: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">- Amenazas:</Label>
                    <Textarea
                      rows={3}
                      value={formData.evaluacion_amenazas}
                      onChange={(e) => setFormData({ ...formData, evaluacion_amenazas: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">- Áreas afectadas:</Label>
                    <Textarea
                      rows={3}
                      value={formData.evaluacion_areas}
                      onChange={(e) => setFormData({ ...formData, evaluacion_areas: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">- Aislamiento:</Label>
                    <Textarea
                      rows={3}
                      value={formData.evaluacion_aislamiento}
                      onChange={(e) => setFormData({ ...formData, evaluacion_aislamiento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">5. Objetivo(s) inicial(es):</Label>
                    <Textarea
                      rows={6}
                      value={formData.objetivos_iniciales}
                      onChange={(e) => setFormData({ ...formData, objetivos_iniciales: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">6. Estrategias:</Label>
                    <Textarea
                      rows={6}
                      value={formData.estrategias}
                      onChange={(e) => setFormData({ ...formData, estrategias: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">7. Tácticas:</Label>
                    <Textarea
                      rows={6}
                      value={formData.tacticas}
                      onChange={(e) => setFormData({ ...formData, tacticas: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">8. Ubicación del PC:</Label>
                    <Input
                      value={formData.ubicacion_pc}
                      onChange={(e) => setFormData({ ...formData, ubicacion_pc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">9. Ubicación del E:</Label>
                    <Input
                      value={formData.ubicacion_e}
                      onChange={(e) => setFormData({ ...formData, ubicacion_e: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">10. Ruta Ingreso:</Label>
                    <Textarea
                      rows={3}
                      value={formData.ruta_ingreso}
                      onChange={(e) => setFormData({ ...formData, ruta_ingreso: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">11. Ruta Egreso:</Label>
                    <Textarea
                      rows={3}
                      value={formData.ruta_egreso}
                      onChange={(e) => setFormData({ ...formData, ruta_egreso: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label className="font-semibold">12. Mensaje General de Seguridad:</Label>
                  <Textarea
                    rows={4}
                    value={formData.mensaje_seguridad}
                    onChange={(e) => setFormData({ ...formData, mensaje_seguridad: e.target.value })}
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <Label className="font-semibold">13. Comandante del Incidente (Nombre, Apellidos) y firma:</Label>
                  <Input
                    value={formData.comandante}
                    onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Página 2 - Mapa Situacional */}
            <TabsContent value="page2" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <Label className="font-semibold text-base">14. Mapa Situacional o Croquis:</Label>
                  <DrawableCanvas 
                    onImageChange={(imageData) => setFormData({ ...formData, mapa_situacional: imageData })}
                  />
                  
                  <div className="space-y-2 border-t pt-4">
                    <Label className="font-semibold">13. Comandante del Incidente (Nombre, Apellidos) y firma:</Label>
                    <Input
                      value={formData.comandante}
                      onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Página 3 - Resumen de Acciones */}
            <TabsContent value="page3" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-base">15. Fecha y Hora / 16. Resumen de las Acciones:</Label>
                    <Button size="sm" onClick={handleAddAccion}>
                      Agregar Acción
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.acciones.map((accion, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-start border rounded-lg p-3 bg-slate-50">
                        <div className="col-span-3">
                          <Input
                            placeholder="Fecha y Hora"
                            value={accion.fecha_hora}
                            onChange={(e) => handleAccionChange(index, 'fecha_hora', e.target.value)}
                          />
                        </div>
                        <div className="col-span-8">
                          <Input
                            placeholder="Resumen de la acción"
                            value={accion.resumen}
                            onChange={(e) => handleAccionChange(index, 'resumen', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newAcciones = formData.acciones.filter((_, i) => i !== index);
                              setFormData({ ...formData, acciones: newAcciones });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t pt-4 mt-6">
                    <Label className="font-semibold">13. Comandante del Incidente (Nombre, Apellidos) y firma:</Label>
                    <Input
                      value={formData.comandante}
                      onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Página 4 - Organigrama */}
            <TabsContent value="page4" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">1. Nombre del Incidente:</Label>
                      <Input
                        value={formData.nombre_incidente}
                        onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">2. Fecha y hora de Preparación:</Label>
                      <Input
                        value={formData.fecha_preparacion}
                        onChange={(e) => setFormData({ ...formData, fecha_preparacion: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-semibold text-base">17. Organigrama Actual:</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 min-h-[400px] bg-slate-50 flex items-center justify-center">
                      <p className="text-slate-400 text-center">
                        Espacio para organigrama<br />
                        <span className="text-xs">Use herramientas de dibujo o pegue una imagen</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <Label className="font-semibold">13. Comandante del Incidente (Nombre, Apellidos) y firma:</Label>
                    <Input
                      value={formData.comandante}
                      onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

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