import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FormSCI221({ open, onClose, incident }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre_incidente: incident?.name || '',
    fecha_hora: format(new Date(), "dd/MM/yyyy HH:mm"),
    periodo_operacional: '',
    tiempo_conclusion: '',
    
    // Sección Planificación
    plan_actividades: false,
    plan_formularios: false,
    plan_reunion: false,
    plan_instruir: false,
    plan_devolver: false,
    plan_completado: false,
    plan_firma: '',
    plan_observaciones: '',
    
    // Sección Operaciones
    op_actividades: false,
    op_organizar: false,
    op_recoger: false,
    op_reportar: false,
    op_residuos: false,
    op_formularios: false,
    op_reunion: false,
    op_documentos: false,
    op_instruir: false,
    op_completado: false,
    op_firma: '',
    op_observaciones: '',
    
    // Sección Logística
    log_actividades: false,
    log_organizar: false,
    log_recoger: false,
    log_reportar: false,
    log_residuos: false,
    log_formularios: false,
    log_reunion: false,
    log_documentos: false,
    log_devolver: false,
    log_instruir: false,
    
    // Logística - Unidad de Instalaciones
    log_inst_limpiar: false,
    log_inst_recoger: false,
    log_inst_asegurar: false,
    
    // Logística - Unidad de Provisiones
    log_prov_asegurar: false,
    log_prov_recoger: false,
    
    // Logística - Unidad de Apoyo Terrestre
    log_apoyo_limpiar: false,
    log_apoyo_inspeccion: false,
    log_apoyo_transporte: false,
    
    // Logística - Unidad de Alimentación
    log_alim_asegurar: false,
    log_alim_embalar: false,
    
    // Logística - Unidad de Comunicaciones
    log_com_asegurar: false,
    log_com_recoger: false,
    
    log_completado: false,
    log_firma: '',
    log_observaciones: '',
    
    // Sección Administración y Finanzas
    admin_actividades: false,
    admin_formularios: false,
    admin_reunion: false,
    admin_instruir: false,
    admin_colectado: false,
    admin_cierres: false,
    admin_informes: false,
    admin_pagos: false,
    admin_devolver: false,
    admin_completado: false,
    admin_firma: '',
    admin_observaciones: '',
    
    preparado_por: '',
    posicion: ''
  });

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
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(`SCI-221-${incident?.incident_number || 'formulario'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">SCI-221 - Verificación de la Desmovilización</DialogTitle>
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
                <h2 className="text-2xl font-bold text-orange-600">Formulario SCI - 221</h2>
                <p className="text-lg font-semibold text-slate-700">Verificación de la Desmovilización</p>
                <p className="text-xs text-slate-500">Rev. 06 - 2015</p>
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
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label className="font-semibold">1. Nombre del Incidente</Label>
                <Input
                  value={formData.nombre_incidente}
                  onChange={(e) => setFormData({ ...formData, nombre_incidente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">2. Fecha/hora</Label>
                <Input
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">3. Periodo operacional</Label>
                <Input
                  value={formData.periodo_operacional}
                  onChange={(e) => setFormData({ ...formData, periodo_operacional: e.target.value })}
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">4. Tiempo estimado de conclusión (fecha/hora)</Label>
                <Input
                  type="datetime-local"
                  value={formData.tiempo_conclusion}
                  onChange={(e) => setFormData({ ...formData, tiempo_conclusion: e.target.value })}
                />
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
              <p className="text-sm text-slate-700 mb-2">
                Usted y sus recursos están en proceso de ser liberados de este incidente, no obstante eso no 
                ocurrirá hasta que los siguientes aspectos se hayan cumplido y sean verificados por el Líder de la 
                Unidad de Desmovilización o el Jefe de la Sección de Planificación.
              </p>
              <p className="text-center font-bold text-red-600 text-base">
                NINGÚN RECURSO ABANDONA LA ESCENA SIN AUTORIZACIÓN
              </p>
            </div>

            {/* 5. Sección de Planificación */}
            <div className="space-y-4 border-2 border-slate-300 p-4 rounded-lg">
              <h3 className="font-bold text-base border-b pb-2">5. Lista de verificación de la Sección de Planificación</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.plan_actividades}
                    onCheckedChange={(checked) => setFormData({ ...formData, plan_actividades: checked })}
                  />
                  <label className="text-sm cursor-pointer">Completar todas las actividades de acuerdo al PAI.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.plan_formularios}
                    onCheckedChange={(checked) => setFormData({ ...formData, plan_formularios: checked })}
                  />
                  <div className="text-sm">
                    <p>Completar y entregar todos los formularios SCI a la Unidad de Documentación.</p>
                    <ul className="ml-6 mt-1 space-y-1 text-xs text-slate-600">
                      <li>○ SCI 202 por cada período operacional.</li>
                      <li>○ SCI 211.</li>
                      <li>○ SCI 214 por cada unidad activada durante todos los períodos operacionales</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.plan_reunion}
                    onCheckedChange={(checked) => setFormData({ ...formData, plan_reunion: checked })}
                  />
                  <label className="text-sm cursor-pointer">Realizar una reunión donde se registren los aspectos positivos y por mejorar del personal de la sección.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.plan_instruir}
                    onCheckedChange={(checked) => setFormData({ ...formData, plan_instruir: checked })}
                  />
                  <label className="text-sm cursor-pointer">Instruir a todo el personal de la sección respecto al proceso de desmovilización.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.plan_devolver}
                    onCheckedChange={(checked) => setFormData({ ...formData, plan_devolver: checked })}
                  />
                  <label className="text-sm cursor-pointer">Devolver todos los recursos que fueron asignados a la Sección.</label>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 p-3 rounded mt-4">
                  <Checkbox 
                    checked={formData.plan_completado}
                    onCheckedChange={(checked) => setFormData({ ...formData, plan_completado: checked })}
                  />
                  <label className="text-sm font-semibold">Completado</label>
                  <div className="flex-1">
                    <Input
                      placeholder="Firma de JSP"
                      value={formData.plan_firma}
                      onChange={(e) => setFormData({ ...formData, plan_firma: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Observaciones</Label>
                  <Textarea
                    rows={3}
                    value={formData.plan_observaciones}
                    onChange={(e) => setFormData({ ...formData, plan_observaciones: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 6. Sección de Operaciones */}
            <div className="space-y-4 border-2 border-slate-300 p-4 rounded-lg">
              <h3 className="font-bold text-base border-b pb-2">6. Lista de verificación de la Sección de Operaciones</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_actividades}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_actividades: checked })}
                  />
                  <label className="text-sm cursor-pointer">Completar todas las actividades de acuerdo al PAI.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_organizar}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_organizar: checked })}
                  />
                  <label className="text-sm cursor-pointer">Organizar los recursos para su desmovilización (por cercanía, por costos, por necesidad)</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_recoger}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_recoger: checked })}
                  />
                  <label className="text-sm cursor-pointer">Recoger, clasificar, reabastecer, devolver/almacenar correctamente las herramientas, equipos y accesorios (HEA´s.)</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_reportar}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_reportar: checked })}
                  />
                  <label className="text-sm cursor-pointer">Reportar cualquier deficiencia o daño en las herramientas, equipos y accesorios (HEA´s.).</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_residuos}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_residuos: checked })}
                  />
                  <label className="text-sm cursor-pointer">Disponer adecuadamente de los residuos y desechos</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_formularios}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_formularios: checked })}
                  />
                  <div className="text-sm">
                    <p>Completar y entregar todos los formularios SCI a la Unidad de Documentación</p>
                    <ul className="ml-6 mt-1 space-y-1 text-xs text-slate-600">
                      <li>○ SCI 204 por cada período operacional.</li>
                      <li>○ SCI 207 del ACV.</li>
                      <li>○ SCI 214 por cada rama, grupo, división, fuerza de tarea, equipo de intervención y recurso simple activados durante los períodos operacionales.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_reunion}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_reunion: checked })}
                  />
                  <label className="text-sm cursor-pointer">Realizar una reunión donde se registren los aspectos positivos y por mejorar del personal de la sección.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_documentos}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_documentos: checked })}
                  />
                  <label className="text-sm cursor-pointer">Entregar cualquier documento contable pendiente a la Sección de Administración Y Finanzas.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.op_instruir}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_instruir: checked })}
                  />
                  <label className="text-sm cursor-pointer">Instruir a todo el personal de la sección respecto al proceso de desmovilización.</label>
                </div>

                <p className="text-xs text-slate-600 italic bg-blue-50 p-2 rounded">
                  Nota: verificar que el personal utilice el equipo de protección personal (EPP) apropiado cuando sea requerido.
                </p>

                <div className="flex items-center gap-3 bg-slate-100 p-3 rounded mt-4">
                  <Checkbox 
                    checked={formData.op_completado}
                    onCheckedChange={(checked) => setFormData({ ...formData, op_completado: checked })}
                  />
                  <label className="text-sm font-semibold">Completado</label>
                  <div className="flex-1">
                    <Input
                      placeholder="Firma de JSO"
                      value={formData.op_firma}
                      onChange={(e) => setFormData({ ...formData, op_firma: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Observaciones</Label>
                  <Textarea
                    rows={3}
                    value={formData.op_observaciones}
                    onChange={(e) => setFormData({ ...formData, op_observaciones: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 7. Sección de Logística */}
            <div className="space-y-4 border-2 border-slate-300 p-4 rounded-lg">
              <h3 className="font-bold text-base border-b pb-2">7. Lista de verificación de la Sección de Logística</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_actividades}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_actividades: checked })}
                  />
                  <label className="text-sm cursor-pointer">Completar todas las actividades de acuerdo al PAI</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_organizar}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_organizar: checked })}
                  />
                  <label className="text-sm cursor-pointer">Organizar los recursos para su desmovilizarán de la misma forma que se registraron.</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_recoger}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_recoger: checked })}
                  />
                  <label className="text-sm cursor-pointer">Recoger, clasificar, reabastecer y almacenar correctamente las HEA´</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_reportar}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_reportar: checked })}
                  />
                  <label className="text-sm cursor-pointer">Reportar cualquier deficiencia o daño y si es necesaria su reposición</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_residuos}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_residuos: checked })}
                  />
                  <label className="text-sm cursor-pointer">Disponer adecuadamente de los residuos</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_formularios}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_formularios: checked })}
                  />
                  <div className="text-sm">
                    <p>Completar y entregar todos los formularios SCI a la Unidad de Documentación</p>
                    <ul className="ml-6 mt-1 space-y-1 text-xs text-slate-600">
                      <li>○ SCI 205 por cada período operacional</li>
                      <li>○ SCI 206 de la UM por cada período operacional</li>
                      <li>○ SCI 207 de la UM</li>
                      <li>○ SCI 214 por cada unidad activada durante todos los períodos operacionales</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_reunion}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_reunion: checked })}
                  />
                  <label className="text-sm cursor-pointer">Realizar una reunión donde se registren los aspectos positivos y por mejorar del personal de la sección</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_documentos}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_documentos: checked })}
                  />
                  <label className="text-sm cursor-pointer">Entregar cualquier documento contable pendiente a la Sección de Administración y Finanzas</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_devolver}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_devolver: checked })}
                  />
                  <label className="text-sm cursor-pointer">Devolver todos los recursos que fueron asignados a la Sección</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.log_instruir}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_instruir: checked })}
                  />
                  <label className="text-sm cursor-pointer">Instruir a todo el personal de la sección respecto al proceso de desmovilización</label>
                </div>

                {/* Subsecciones de Logística */}
                <div className="ml-6 space-y-4 mt-4 border-l-2 border-blue-300 pl-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">7.a Unidad de Instalaciones</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_inst_limpiar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_inst_limpiar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Limpiar, desmontar y embalar correctamente todas las instalaciones</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_inst_recoger}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_inst_recoger: checked })}
                        />
                        <label className="text-xs cursor-pointer">Recoger, clasificar, reabastecer y almacenar correctamente las HEA´s</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_inst_asegurar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_inst_asegurar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Asegurar instalaciones de descanso e higiene mientras se realiza la desmovilización</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">7.b Unidad de Provisiones</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_prov_asegurar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_prov_asegurar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Asegurar que todos los bienes no descartables se devuelven o contabilizan</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_prov_recoger}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_prov_recoger: checked })}
                        />
                        <label className="text-xs cursor-pointer">Recoger, clasificar, reabastecer y almacenar correctamente las HEA´s</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">7.c Unidad de Apoyo Terrestre</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_apoyo_limpiar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_apoyo_limpiar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Limpiar y reabastecer correctamente todos los vehículos</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_apoyo_inspeccion}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_apoyo_inspeccion: checked })}
                        />
                        <label className="text-xs cursor-pointer">Realizar inspección de todos los vehículos</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_apoyo_transporte}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_apoyo_transporte: checked })}
                        />
                        <label className="text-xs cursor-pointer">Asegurar el transporte durante el proceso de desmovilización</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">7.d Unidad de Alimentación</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_alim_asegurar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_alim_asegurar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Asegurar que haya alimentos adecuados para el personal que sale y el que queda</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_alim_embalar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_alim_embalar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Embalar adecuadamente los insumos alimenticios no utilizados en el incidente</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">7.e Unidad de Comunicaciones</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_com_asegurar}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_com_asegurar: checked })}
                        />
                        <label className="text-xs cursor-pointer">Asegurar que todos los radios, celulares y localizadores se devuelven /contabilizan</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={formData.log_com_recoger}
                          onCheckedChange={(checked) => setFormData({ ...formData, log_com_recoger: checked })}
                        />
                        <label className="text-xs cursor-pointer">Recoger, clasificar, reabastecer y almacenar correctamente todos los equipos</label>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic bg-blue-50 p-2 rounded">
                  Nota: verificar que el personal utilice el EPP apropiado cuando sea requerido
                </p>

                <div className="flex items-center gap-3 bg-slate-100 p-3 rounded mt-4">
                  <Checkbox 
                    checked={formData.log_completado}
                    onCheckedChange={(checked) => setFormData({ ...formData, log_completado: checked })}
                  />
                  <label className="text-sm font-semibold">Completado</label>
                  <div className="flex-1">
                    <Input
                      placeholder="Firma de JSL"
                      value={formData.log_firma}
                      onChange={(e) => setFormData({ ...formData, log_firma: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Observaciones</Label>
                  <Textarea
                    rows={3}
                    value={formData.log_observaciones}
                    onChange={(e) => setFormData({ ...formData, log_observaciones: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 8. Sección de Administración y Finanzas */}
            <div className="space-y-4 border-2 border-slate-300 p-4 rounded-lg">
              <h3 className="font-bold text-base border-b pb-2">8. Lista de verificación de la Sección de Administración y Finanzas</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_actividades}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_actividades: checked })}
                  />
                  <label className="text-sm cursor-pointer">Completar todas las actividades de acuerdo al PAI</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_formularios}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_formularios: checked })}
                  />
                  <div className="text-sm">
                    <p>Completar y entregar todos los formularios SCI a la Unidad de Documentación</p>
                    <ul className="ml-6 mt-1 space-y-1 text-xs text-slate-600">
                      <li>○ SCI 214 por cada unidad activada durante todos los períodos operacionales</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_reunion}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_reunion: checked })}
                  />
                  <label className="text-sm cursor-pointer">Realizar una reunión donde se registren los aspectos positivos y por mejorar del personal de la sección</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_instruir}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_instruir: checked })}
                  />
                  <label className="text-sm cursor-pointer">Instruir a todo el personal de la sección respecto al proceso de desmovilización</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_colectado}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_colectado: checked })}
                  />
                  <label className="text-sm cursor-pointer">Verificar que se han colectado todos los documentos contables pendientes</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_cierres}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_cierres: checked })}
                  />
                  <label className="text-sm cursor-pointer">Realizar los cierres contables</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_informes}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_informes: checked })}
                  />
                  <label className="text-sm cursor-pointer">Finalizar todos los informes de tiempo horas/hombre</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_pagos}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_pagos: checked })}
                  />
                  <label className="text-sm cursor-pointer">Realizar/tramitar todos los pagos pendientes</label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={formData.admin_devolver}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_devolver: checked })}
                  />
                  <label className="text-sm cursor-pointer">Devolver todos los recursos que fueron asignados a la Sección</label>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 p-3 rounded mt-4">
                  <Checkbox 
                    checked={formData.admin_completado}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_completado: checked })}
                  />
                  <label className="text-sm font-semibold">Completado</label>
                  <div className="flex-1">
                    <Input
                      placeholder="Firma de JSAF"
                      value={formData.admin_firma}
                      onChange={(e) => setFormData({ ...formData, admin_firma: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Observaciones</Label>
                  <Textarea
                    rows={3}
                    value={formData.admin_observaciones}
                    onChange={(e) => setFormData({ ...formData, admin_observaciones: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Footer - Preparado por */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2">
              <div className="space-y-2">
                <Label className="font-semibold">9. Preparado por</Label>
                <Input
                  value={formData.preparado_por}
                  onChange={(e) => setFormData({ ...formData, preparado_por: e.target.value })}
                  placeholder="Nombre"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">10. Posición</Label>
                <Input
                  value={formData.posicion}
                  onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                  placeholder="Cargo"
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