import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Printer, Download, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI202({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    fecha_inicio_periodo: '',
    fecha_fin_periodo: '',
    acciones: [
      { objetivo: '', estrategia: '', tactica: '', recursos_lugar: '', recursos_solicitar: '', asignacion: '' }
    ],
    mensaje_seguridad: '',
    pronostico_tiempo: '',
    jefe_planificacion: '',
    comandante: incident?.incident_commander || '',
  });

  const handleAddAccion = () => {
    setFormData({
      ...formData,
      acciones: [...formData.acciones, { objetivo: '', estrategia: '', tactica: '', recursos_lugar: '', recursos_solicitar: '', asignacion: '' }]
    });
  };

  const handleAccionChange = (index, field, value) => {
    const newAcciones = [...formData.acciones];
    newAcciones[index][field] = value;
    setFormData({ ...formData, acciones: newAcciones });
  };

  const handleRemoveAccion = (index) => {
    if (formData.acciones.length > 1) {
      const newAcciones = formData.acciones.filter((_, i) => i !== index);
      setFormData({ ...formData, acciones: newAcciones });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Capturar todas las páginas del documento
    const pages = formRef.current.querySelectorAll('[role="tabpanel"]');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Hacer visible la página temporalmente para capturarla
      const originalDisplay = page.style.display;
      page.style.display = 'block';
      page.setAttribute('data-state', 'active');
      
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: page.scrollWidth,
        windowHeight: page.scrollHeight
      });
      
      // Restaurar el estado original
      page.style.display = originalDisplay;
      if (i !== 0) page.setAttribute('data-state', 'inactive');
      
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Agregar nueva página si no es la primera
      if (i > 0) {
        pdf.addPage();
      }
      
      // Agregar imagen de la página
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }
    
    pdf.save(`SCI-202-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-202-Plan de Acción del Incidente</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 202</h2>
                <p className="text-lg font-semibold text-slate-700">Plan de Acción del Incidente</p>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="page1">Página 1</TabsTrigger>
              <TabsTrigger value="page2">Página 2</TabsTrigger>
              <TabsTrigger value="page3">Página 3</TabsTrigger>
            </TabsList>

            {/* Página 1 */}
            <TabsContent value="page1" className="space-y-4">
              <Card className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
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

                <div className="grid grid-cols-2 gap-4 mb-6">
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-base">Plan de Acción:</Label>
                    <Button size="sm" onClick={handleAddAccion}>
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Fila
                    </Button>
                  </div>

                  {formData.acciones.map((accion, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-700">Acción {index + 1}</span>
                        {formData.acciones.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAccion(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">6. Objetivo(s):</Label>
                          <Textarea
                            rows={3}
                            value={accion.objetivo}
                            onChange={(e) => handleAccionChange(index, 'objetivo', e.target.value)}
                            placeholder="Describa el objetivo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">7. Estrategia(s):</Label>
                          <Textarea
                            rows={3}
                            value={accion.estrategia}
                            onChange={(e) => handleAccionChange(index, 'estrategia', e.target.value)}
                            placeholder="Describa la estrategia"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">8. Táctica(s):</Label>
                          <Textarea
                            rows={3}
                            value={accion.tactica}
                            onChange={(e) => handleAccionChange(index, 'tactica', e.target.value)}
                            placeholder="Describa las tácticas"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">9. Cantidad de Recursos (En el lugar):</Label>
                          <Input
                            value={accion.recursos_lugar}
                            onChange={(e) => handleAccionChange(index, 'recursos_lugar', e.target.value)}
                            placeholder="Ej: 5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">9. Cantidad de Recursos (Por solicitar):</Label>
                          <Input
                            value={accion.recursos_solicitar}
                            onChange={(e) => handleAccionChange(index, 'recursos_solicitar', e.target.value)}
                            placeholder="Ej: 3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">10. Asignación(es)/Ubicación:</Label>
                          <Input
                            value={accion.asignacion}
                            onChange={(e) => handleAccionChange(index, 'asignacion', e.target.value)}
                            placeholder="Describa asignación"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="font-semibold">11. Preparado por el JSP:</Label>
                    <Input
                      value={formData.jefe_planificacion}
                      onChange={(e) => setFormData({ ...formData, jefe_planificacion: e.target.value })}
                      placeholder="Nombre del Jefe de Sección de Planificación"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">12. Aprobado por el CI:</Label>
                    <Input
                      value={formData.comandante}
                      onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                      placeholder="Nombre del Comandante del Incidente"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Página 2 */}
            <TabsContent value="page2" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-base">13. Mensaje General de Seguridad de acuerdo a la(s) amenaza(s) identificada(s):</Label>
                    <Textarea
                      rows={5}
                      value={formData.mensaje_seguridad}
                      onChange={(e) => setFormData({ ...formData, mensaje_seguridad: e.target.value })}
                      placeholder="Describa las medidas de seguridad y amenazas identificadas..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-base">14. Pronóstico del Tiempo:</Label>
                    <Textarea
                      rows={4}
                      value={formData.pronostico_tiempo}
                      onChange={(e) => setFormData({ ...formData, pronostico_tiempo: e.target.value })}
                      placeholder="Describa el pronóstico del tiempo para el periodo operacional..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="font-semibold">11. Preparado por el Jefe de Planificación:</Label>
                      <Input
                        value={formData.jefe_planificacion}
                        onChange={(e) => setFormData({ ...formData, jefe_planificacion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">12. Aprobado por el Comandante de Incidente:</Label>
                      <Input
                        value={formData.comandante}
                        onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Página 3 */}
            <TabsContent value="page3" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <Label className="font-semibold text-base">15. Organigrama para el Periodo Operacional:</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 min-h-[500px] bg-slate-50 flex items-center justify-center">
                    <p className="text-slate-400 text-center">
                      Espacio para organigrama del periodo operacional<br />
                      <span className="text-xs">Use herramientas de dibujo o pegue una imagen</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="font-semibold">11. Preparado por el Jefe de Planificación:</Label>
                      <Input
                        value={formData.jefe_planificacion}
                        onChange={(e) => setFormData({ ...formData, jefe_planificacion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">12. Aprobado por el Comandante de Incidente:</Label>
                      <Input
                        value={formData.comandante}
                        onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
                      />
                    </div>
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