import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI203({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_preparacion: format(new Date(), "dd/MM/yyyy"),
    hora_preparacion: format(new Date(), "HH:mm"),
    periodo_operacional: '',
    // Comandante y Staff
    comandante_principal: incident?.incident_commander || '',
    comandante_adjunto: '',
    oficial_seguridad: '',
    oficial_info_publica: '',
    oficial_enlace: '',
    // Representantes Institucionales
    representantes: [{ institucion: '', nombre: '' }],
    // Sección de Planificación
    planificacion_jefe: '',
    planificacion_adjunto: '',
    planificacion_recursos: '',
    planificacion_situacion: '',
    planificacion_documentacion: '',
    planificacion_desmovilizacion: '',
    planificacion_tecnicos: '',
    // Sección de Logística
    logistica_jefe: '',
    logistica_adjunto: '',
    // Rama de Soporte
    soporte_coordinador: '',
    soporte_suministros: '',
    soporte_instalaciones: '',
    soporte_transporte: '',
    // Rama de Servicios
    servicios_coordinador: '',
    servicios_comunicaciones: '',
    servicios_medica: '',
    servicios_alimentacion: '',
    // Sección de Operaciones
    operaciones_jefe: '',
    operaciones_adjunto: '',
    // Rama I
    rama1_coordinador: '',
    rama1_asistente: '',
    rama1_divisiones: ['', '', '', '', ''],
    // Rama II
    rama2_coordinador: '',
    rama2_asistente: '',
    rama2_divisiones: ['', '', '', '', ''],
    // Rama III
    rama3_coordinador: '',
    rama3_asistente: '',
    rama3_divisiones: ['', '', '', '', ''],
    // Operaciones Aéreas
    aereas_coordinador: '',
    aereas_supervisor_tactico: '',
    aereas_supervisor_soporte: '',
    aereas_supervisor_helicopteros: '',
    aereas_supervisor_ala_fija: '',
    // Sección de Finanzas
    finanzas_jefe: '',
    finanzas_adjunto: '',
    finanzas_tiempos: '',
    finanzas_proveeduria: '',
    finanzas_pagos: '',
    finanzas_desmovilizacion: '',
    finanzas_costos: '',
    preparado_por: '',
  });

  const handleAddRepresentante = () => {
    setFormData({
      ...formData,
      representantes: [...formData.representantes, { institucion: '', nombre: '' }]
    });
  };

  const handleRepresentanteChange = (index, field, value) => {
    const newRepresentantes = [...formData.representantes];
    newRepresentantes[index][field] = value;
    setFormData({ ...formData, representantes: newRepresentantes });
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
    pdf.save(`SCI-203-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-203-Listado de Asignación en la Organización</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 203</h2>
                <p className="text-lg font-semibold text-slate-700">Listado de Asignación en la Organización</p>
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
                <Label className="font-semibold">1. Nombre del incidente:</Label>
                <Input
                  value={formData.nombre_incidente}
                  onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">2. Fecha de preparación:</Label>
                <Input
                  value={formData.fecha_preparacion}
                  onChange={(e) => setFormData({ ...formData, fecha_preparacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">3. Hora de preparación:</Label>
                <Input
                  value={formData.hora_preparacion}
                  onChange={(e) => setFormData({ ...formData, hora_preparacion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 mb-6 pb-4 border-b">
              <Label className="font-semibold">4. Periodo Operacional (Fecha / Hora):</Label>
              <Input
                value={formData.periodo_operacional}
                onChange={(e) => setFormData({ ...formData, periodo_operacional: e.target.value })}
                placeholder="Ej: 01/01/2024 08:00 - 20:00"
              />
            </div>

            {/* 5. Comandante de incidente y Staff */}
            <div className="space-y-4 mb-6 pb-4 border-b">
              <Label className="font-semibold text-base">5. Comandante de incidente y Staff</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Principal</Label>
                  <Input
                    value={formData.comandante_principal}
                    onChange={(e) => setFormData({ ...formData, comandante_principal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Adjunto</Label>
                  <Input
                    value={formData.comandante_adjunto}
                    onChange={(e) => setFormData({ ...formData, comandante_adjunto: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Oficial seguridad</Label>
                  <Input
                    value={formData.oficial_seguridad}
                    onChange={(e) => setFormData({ ...formData, oficial_seguridad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Oficial información pública</Label>
                  <Input
                    value={formData.oficial_info_publica}
                    onChange={(e) => setFormData({ ...formData, oficial_info_publica: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Oficial enlace</Label>
                  <Input
                    value={formData.oficial_enlace}
                    onChange={(e) => setFormData({ ...formData, oficial_enlace: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 6. Representantes Institucionales */}
            <div className="space-y-4 mb-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-base">6. Representantes Institucionales</Label>
                <Button size="sm" onClick={handleAddRepresentante}>Agregar</Button>
              </div>
              <div className="space-y-2">
                {formData.representantes.map((rep, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Institución"
                      value={rep.institucion}
                      onChange={(e) => handleRepresentanteChange(index, 'institucion', e.target.value)}
                    />
                    <Input
                      placeholder="Nombre"
                      value={rep.nombre}
                      onChange={(e) => handleRepresentanteChange(index, 'nombre', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 7. SECCIÓN DE PLANIFICACIÓN */}
            <div className="space-y-4 mb-6 pb-4 border-b bg-slate-50 p-4 rounded-lg">
              <Label className="font-semibold text-base text-orange-600">7. SECCIÓN DE PLANIFICACIÓN</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Jefe</Label>
                  <Input
                    value={formData.planificacion_jefe}
                    onChange={(e) => setFormData({ ...formData, planificacion_jefe: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Adjunto</Label>
                  <Input
                    value={formData.planificacion_adjunto}
                    onChange={(e) => setFormData({ ...formData, planificacion_adjunto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad recursos</Label>
                  <Input
                    value={formData.planificacion_recursos}
                    onChange={(e) => setFormData({ ...formData, planificacion_recursos: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad situación</Label>
                  <Input
                    value={formData.planificacion_situacion}
                    onChange={(e) => setFormData({ ...formData, planificacion_situacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad documentación</Label>
                  <Input
                    value={formData.planificacion_documentacion}
                    onChange={(e) => setFormData({ ...formData, planificacion_documentacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad desmovilización</Label>
                  <Input
                    value={formData.planificacion_desmovilizacion}
                    onChange={(e) => setFormData({ ...formData, planificacion_desmovilizacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-sm">Técnicos especialistas</Label>
                  <Input
                    value={formData.planificacion_tecnicos}
                    onChange={(e) => setFormData({ ...formData, planificacion_tecnicos: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 8. SECCIÓN DE LOGÍSTICA */}
            <div className="space-y-4 mb-6 pb-4 border-b bg-blue-50 p-4 rounded-lg">
              <Label className="font-semibold text-base text-orange-600">8. SECCIÓN DE LOGÍSTICA</Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm">Jefe</Label>
                  <Input
                    value={formData.logistica_jefe}
                    onChange={(e) => setFormData({ ...formData, logistica_jefe: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Adjunto</Label>
                  <Input
                    value={formData.logistica_adjunto}
                    onChange={(e) => setFormData({ ...formData, logistica_adjunto: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 pl-4 border-l-4 border-blue-400">
                <Label className="font-semibold text-sm">A. RAMA DE SOPORTE</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coordinador</Label>
                    <Input
                      value={formData.soporte_coordinador}
                      onChange={(e) => setFormData({ ...formData, soporte_coordinador: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unidad de suministros</Label>
                    <Input
                      value={formData.soporte_suministros}
                      onChange={(e) => setFormData({ ...formData, soporte_suministros: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unidad de instalaciones</Label>
                    <Input
                      value={formData.soporte_instalaciones}
                      onChange={(e) => setFormData({ ...formData, soporte_instalaciones: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unidad de transporte</Label>
                    <Input
                      value={formData.soporte_transporte}
                      onChange={(e) => setFormData({ ...formData, soporte_transporte: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pl-4 border-l-4 border-blue-400">
                <Label className="font-semibold text-sm">B. RAMA DE SERVICIOS</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coordinador</Label>
                    <Input
                      value={formData.servicios_coordinador}
                      onChange={(e) => setFormData({ ...formData, servicios_coordinador: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unidad de comunicaciones</Label>
                    <Input
                      value={formData.servicios_comunicaciones}
                      onChange={(e) => setFormData({ ...formData, servicios_comunicaciones: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unidad médica</Label>
                    <Input
                      value={formData.servicios_medica}
                      onChange={(e) => setFormData({ ...formData, servicios_medica: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unidad de alimentación</Label>
                    <Input
                      value={formData.servicios_alimentacion}
                      onChange={(e) => setFormData({ ...formData, servicios_alimentacion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 9. SECCIÓN DE OPERACIONES */}
            <div className="space-y-4 mb-6 pb-4 border-b bg-red-50 p-4 rounded-lg">
              <Label className="font-semibold text-base text-orange-600">9. SECCIÓN DE OPERACIONES</Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm">Jefe</Label>
                  <Input
                    value={formData.operaciones_jefe}
                    onChange={(e) => setFormData({ ...formData, operaciones_jefe: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Adjunto</Label>
                  <Input
                    value={formData.operaciones_adjunto}
                    onChange={(e) => setFormData({ ...formData, operaciones_adjunto: e.target.value })}
                  />
                </div>
              </div>

              {/* Rama I */}
              <div className="space-y-2 pl-4 border-l-4 border-red-400">
                <Label className="font-semibold text-sm">A. RAMA I DIVISIÓN / GRUPOS</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coordinador</Label>
                    <Input
                      value={formData.rama1_coordinador}
                      onChange={(e) => setFormData({ ...formData, rama1_coordinador: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Asistente</Label>
                    <Input
                      value={formData.rama1_asistente}
                      onChange={(e) => setFormData({ ...formData, rama1_asistente: e.target.value })}
                    />
                  </div>
                  {formData.rama1_divisiones.map((div, idx) => (
                    <div key={idx} className="space-y-2">
                      <Label className="text-xs">División / Grupo {idx + 1}</Label>
                      <Input
                        value={div}
                        onChange={(e) => {
                          const newDivisiones = [...formData.rama1_divisiones];
                          newDivisiones[idx] = e.target.value;
                          setFormData({ ...formData, rama1_divisiones: newDivisiones });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rama II */}
              <div className="space-y-2 pl-4 border-l-4 border-red-400">
                <Label className="font-semibold text-sm">B. RAMA II DIVISIÓN / GRUPOS</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coordinador</Label>
                    <Input
                      value={formData.rama2_coordinador}
                      onChange={(e) => setFormData({ ...formData, rama2_coordinador: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Asistente</Label>
                    <Input
                      value={formData.rama2_asistente}
                      onChange={(e) => setFormData({ ...formData, rama2_asistente: e.target.value })}
                    />
                  </div>
                  {formData.rama2_divisiones.map((div, idx) => (
                    <div key={idx} className="space-y-2">
                      <Label className="text-xs">División / Grupo {idx + 1}</Label>
                      <Input
                        value={div}
                        onChange={(e) => {
                          const newDivisiones = [...formData.rama2_divisiones];
                          newDivisiones[idx] = e.target.value;
                          setFormData({ ...formData, rama2_divisiones: newDivisiones });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rama III */}
              <div className="space-y-2 pl-4 border-l-4 border-red-400">
                <Label className="font-semibold text-sm">C. RAMA III DIVISIÓN / GRUPOS</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coordinador</Label>
                    <Input
                      value={formData.rama3_coordinador}
                      onChange={(e) => setFormData({ ...formData, rama3_coordinador: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Asistente</Label>
                    <Input
                      value={formData.rama3_asistente}
                      onChange={(e) => setFormData({ ...formData, rama3_asistente: e.target.value })}
                    />
                  </div>
                  {formData.rama3_divisiones.map((div, idx) => (
                    <div key={idx} className="space-y-2">
                      <Label className="text-xs">División / Grupo {idx + 1}</Label>
                      <Input
                        value={div}
                        onChange={(e) => {
                          const newDivisiones = [...formData.rama3_divisiones];
                          newDivisiones[idx] = e.target.value;
                          setFormData({ ...formData, rama3_divisiones: newDivisiones });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Operaciones Aéreas */}
              <div className="space-y-2 pl-4 border-l-4 border-red-400">
                <Label className="font-semibold text-sm">D. RAMA OPERACIONES AÉREAS</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coordinador</Label>
                    <Input
                      value={formData.aereas_coordinador}
                      onChange={(e) => setFormData({ ...formData, aereas_coordinador: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Supervisor táctico</Label>
                    <Input
                      value={formData.aereas_supervisor_tactico}
                      onChange={(e) => setFormData({ ...formData, aereas_supervisor_tactico: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Supervisor de soporte</Label>
                    <Input
                      value={formData.aereas_supervisor_soporte}
                      onChange={(e) => setFormData({ ...formData, aereas_supervisor_soporte: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Supervisor helicopteros</Label>
                    <Input
                      value={formData.aereas_supervisor_helicopteros}
                      onChange={(e) => setFormData({ ...formData, aereas_supervisor_helicopteros: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Supervisor ala fija</Label>
                    <Input
                      value={formData.aereas_supervisor_ala_fija}
                      onChange={(e) => setFormData({ ...formData, aereas_supervisor_ala_fija: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 10. SECCIÓN DE FINANZAS */}
            <div className="space-y-4 mb-6 pb-4 border-b bg-green-50 p-4 rounded-lg">
              <Label className="font-semibold text-base text-orange-600">10. SECCIÓN DE FINANZAS</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Jefe</Label>
                  <Input
                    value={formData.finanzas_jefe}
                    onChange={(e) => setFormData({ ...formData, finanzas_jefe: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Adjunto</Label>
                  <Input
                    value={formData.finanzas_adjunto}
                    onChange={(e) => setFormData({ ...formData, finanzas_adjunto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad de tiempos</Label>
                  <Input
                    value={formData.finanzas_tiempos}
                    onChange={(e) => setFormData({ ...formData, finanzas_tiempos: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad de proveeduría</Label>
                  <Input
                    value={formData.finanzas_proveeduria}
                    onChange={(e) => setFormData({ ...formData, finanzas_proveeduria: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad de pagos</Label>
                  <Input
                    value={formData.finanzas_pagos}
                    onChange={(e) => setFormData({ ...formData, finanzas_pagos: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad desmovilización</Label>
                  <Input
                    value={formData.finanzas_desmovilizacion}
                    onChange={(e) => setFormData({ ...formData, finanzas_desmovilizacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidad de costos</Label>
                  <Input
                    value={formData.finanzas_costos}
                    onChange={(e) => setFormData({ ...formData, finanzas_costos: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 11. Preparado por */}
            <div className="space-y-2">
              <Label className="font-semibold">11. Preparado por: (Unidad de recursos)</Label>
              <Input
                value={formData.preparado_por}
                onChange={(e) => setFormData({ ...formData, preparado_por: e.target.value })}
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