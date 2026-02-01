import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function FormInformeAlfa({ open, onClose, incident }) {
  const formRef = useRef(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    incident_id: incident?.id,
    numero_informe: '',
    // Identificación
    region: incident?.region || '',
    provincia: incident?.provincia || '',
    comuna: incident?.comuna || '',
    fuente: '',
    telefono: '',
    // Tipo de Evento
    tipo_evento: {
      sismo: false,
      escala_mercalli: '',
      inundacion: false,
      temporal: false,
      deslizamiento: false,
      actividad_volcanica: false,
      incendio_forestal: false,
      incendio_urbano: false,
      sustancias_peligrosas: false,
      accidente_mult_victimas: false,
      corte_energia: false,
      corte_agua: false,
      otro: false,
      otro_descripcion: ''
    },
    descripcion_evento: incident?.description || '',
    fecha_ocurrencia: incident?.start_time ? format(new Date(incident.start_time), "yyyy-MM-dd") : '',
    hora_ocurrencia: incident?.start_time ? format(new Date(incident.start_time), "HH:mm") : '',
    dia_semana: '',
    direccion_ubicacion: incident?.location || '',
    // Daños
    personas_afectadas_h: '',
    personas_afectadas_m: '',
    personas_damnificadas_h: '',
    personas_damnificadas_m: '',
    personas_heridas: '',
    personas_muertas: '',
    personas_desaparecidas: '',
    personas_albergadas: '',
    viviendas_danio_menor: '',
    viviendas_danio_mayor: '',
    viviendas_destruidas: '',
    viviendas_no_evaluadas: '',
    monto_estimado_danios: '',
    // Decisiones y Acciones
    decisiones_acciones: '',
    tiempo_restablecimiento: '',
    // Recursos
    recursos_involucrados: '',
    // Evaluación de Necesidades
    no_requiere_evaluacion: false,
    requiere_evaluacion: false,
    necesidades_detalle: '',
    // Nivel de Emergencia
    nivel_emergencia: '',
    // Observaciones
    observaciones: '',
    // Responsable
    responsable_nombre: '',
    responsable_fecha: format(new Date(), "dd/MM/yyyy"),
    responsable_hora: format(new Date(), "HH:mm")
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.FormInformeAlfa.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['informes-alfa', incident?.id] });
      alert('Informe Alfa guardado exitosamente');
    },
    onError: (error) => {
      console.error('Error al guardar:', error);
      alert('Error al guardar el informe');
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      tipo_evento: JSON.stringify(formData.tipo_evento)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
      pdf.save(`Informe-Alfa-${incident?.incident_number || 'formulario'}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Informe Alfa - SENAPRED</DialogTitle>
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
          <div className="border-b-2 border-blue-600 pb-4">
            <div className="flex items-start justify-between">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/b5ac78cc1_LogoSENAPRED.png" 
                alt="Logo SENAPRED"
                className="w-20 h-20 object-contain"
              />
              <div className="flex-1 text-center">
                <h2 className="text-2xl font-bold text-blue-600">PLAN DEDOS</h2>
                <h3 className="text-xl font-bold text-orange-600">INFORME ALFA</h3>
                <p className="text-base font-semibold text-slate-700">INFORME DE INCIDENTE O EMERGENCIA Nº</p>
                <Input 
                  className="w-32 mx-auto mt-2"
                  value={formData.numero_informe}
                  onChange={(e) => setFormData({ ...formData, numero_informe: e.target.value })}
                />
              </div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/b5ac78cc1_LogoSENAPRED.png" 
                alt="Gobierno de Chile"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>

          {/* 1. IDENTIFICACIÓN */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">1. IDENTIFICACIÓN:</Label>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="space-y-2">
                <Label className="text-sm">REGIÓN:</Label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">PROVINCIA:</Label>
                <Input
                  value={formData.provincia}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">COMUNA:</Label>
                <Input
                  value={formData.comuna}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">FUENTE(S):</Label>
                <Input
                  value={formData.fuente}
                  onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">FONO:</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* 2. TIPO DE EVENTO */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">2. TIPO DE EVENTO</Label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.sismo}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, sismo: checked } 
                  })}
                />
                <Label className="text-sm">SISMO (Escala Mercalli)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.inundacion}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, inundacion: checked } 
                  })}
                />
                <Label className="text-sm">INUNDACIÓN</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.incendio_urbano}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, incendio_urbano: checked } 
                  })}
                />
                <Label className="text-sm">INCENDIO URBANO</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.temporal}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, temporal: checked } 
                  })}
                />
                <Label className="text-sm">TEMPORAL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.sustancias_peligrosas}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, sustancias_peligrosas: checked } 
                  })}
                />
                <Label className="text-sm">SUST. PELIGROSAS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.deslizamiento}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, deslizamiento: checked } 
                  })}
                />
                <Label className="text-sm">DESLIZAMIENTO</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.accidente_mult_victimas}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, accidente_mult_victimas: checked } 
                  })}
                />
                <Label className="text-sm">ACC. MULT. VÍCTIMAS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.actividad_volcanica}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, actividad_volcanica: checked } 
                  })}
                />
                <Label className="text-sm">ACT. VOLCÁNICA</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.corte_energia}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, corte_energia: checked } 
                  })}
                />
                <Label className="text-sm">CORTE ENERGÍA ELÉCT.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.incendio_forestal}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, incendio_forestal: checked } 
                  })}
                />
                <Label className="text-sm">INC. FORESTAL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.corte_agua}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, corte_agua: checked } 
                  })}
                />
                <Label className="text-sm">CORTE AGUA POTABLE</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tipo_evento.otro}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    tipo_evento: { ...formData.tipo_evento, otro: checked } 
                  })}
                />
                <Label className="text-sm">OTRO</Label>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <Label className="text-sm font-semibold">DESCRIPCIÓN DEL EVENTO:</Label>
              <Textarea
                rows={3}
                value={formData.descripcion_evento}
                onChange={(e) => setFormData({ ...formData, descripcion_evento: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">OCURRENCIA:</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">HORA</Label>
                    <Input
                      type="time"
                      value={formData.hora_ocurrencia}
                      onChange={(e) => setFormData({ ...formData, hora_ocurrencia: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">DÍA</Label>
                    <Input
                      value={formData.dia_semana}
                      onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                      placeholder="LU"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">FECHA</Label>
                    <Input
                      type="date"
                      value={formData.fecha_ocurrencia}
                      onChange={(e) => setFormData({ ...formData, fecha_ocurrencia: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">DIRECCIÓN / UBICACIÓN:</Label>
                <Input
                  value={formData.direccion_ubicacion}
                  onChange={(e) => setFormData({ ...formData, direccion_ubicacion: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* 3. DAÑOS */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">3. DAÑOS</Label>
            <div className="grid grid-cols-2 gap-6">
              {/* Personas */}
              <div>
                <Label className="font-semibold mb-2 block">PERSONAS</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Label className="text-xs">AFECTADAS</Label>
                    <Input placeholder="H" value={formData.personas_afectadas_h} onChange={(e) => setFormData({ ...formData, personas_afectadas_h: e.target.value })} />
                    <Input placeholder="M" value={formData.personas_afectadas_m} onChange={(e) => setFormData({ ...formData, personas_afectadas_m: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Label className="text-xs">DAMNIFICADAS*</Label>
                    <Input placeholder="H" value={formData.personas_damnificadas_h} onChange={(e) => setFormData({ ...formData, personas_damnificadas_h: e.target.value })} />
                    <Input placeholder="M" value={formData.personas_damnificadas_m} onChange={(e) => setFormData({ ...formData, personas_damnificadas_m: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">HERIDAS</Label>
                    <Input value={formData.personas_heridas} onChange={(e) => setFormData({ ...formData, personas_heridas: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">MUERTAS</Label>
                    <Input value={formData.personas_muertas} onChange={(e) => setFormData({ ...formData, personas_muertas: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">DESAPARECIDAS*</Label>
                    <Input value={formData.personas_desaparecidas} onChange={(e) => setFormData({ ...formData, personas_desaparecidas: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">ALBERGADOS*</Label>
                    <Input value={formData.personas_albergadas} onChange={(e) => setFormData({ ...formData, personas_albergadas: e.target.value })} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">(*) OBLIGATORIEDAD DE DESAGREGAR POR SEXO</p>
              </div>

              {/* Viviendas */}
              <div>
                <Label className="font-semibold mb-2 block">VIVIENDAS</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">DAÑO MENOR HABITABLE</Label>
                    <Input value={formData.viviendas_danio_menor} onChange={(e) => setFormData({ ...formData, viviendas_danio_menor: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">DAÑO MAYOR NO HABITABLE</Label>
                    <Input value={formData.viviendas_danio_mayor} onChange={(e) => setFormData({ ...formData, viviendas_danio_mayor: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">DESTRUIDA IRRECUPERABLE</Label>
                    <Input value={formData.viviendas_destruidas} onChange={(e) => setFormData({ ...formData, viviendas_destruidas: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label className="text-xs">NO EVALUADAS</Label>
                    <Input value={formData.viviendas_no_evaluadas} onChange={(e) => setFormData({ ...formData, viviendas_no_evaluadas: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-semibold">MONTO ESTIMADO DE DAÑOS ($):</Label>
              <Input
                value={formData.monto_estimado_danios}
                onChange={(e) => setFormData({ ...formData, monto_estimado_danios: e.target.value })}
              />
            </div>
          </Card>

          {/* 4. DECISIONES Y ACCIONES */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">4. DECISIONES ACCIONES Y SOLUCIONES INMEDIATAS:</Label>
            <Textarea
              rows={4}
              value={formData.decisiones_acciones}
              onChange={(e) => setFormData({ ...formData, decisiones_acciones: e.target.value })}
            />
            <div className="mt-3 space-y-2">
              <Label className="text-sm font-semibold">OPORTUNIDAD (TPO) RESTABLECIMIENTO:</Label>
              <Input
                value={formData.tiempo_restablecimiento}
                onChange={(e) => setFormData({ ...formData, tiempo_restablecimiento: e.target.value })}
              />
            </div>
          </Card>

          {/* 5. RECURSOS INVOLUCRADOS */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">5. RECURSOS INVOLUCRADOS TIPO (HUMANO-MATERIAL)</Label>
            <Textarea
              rows={4}
              value={formData.recursos_involucrados}
              onChange={(e) => setFormData({ ...formData, recursos_involucrados: e.target.value })}
            />
          </Card>

          {/* 6. EVALUACIÓN DE NECESIDADES */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">6. EVALUACIÓN DE NECESIDADES</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.no_requiere_evaluacion}
                  onCheckedChange={(checked) => setFormData({ ...formData, no_requiere_evaluacion: checked })}
                />
                <Label>NO SE REQUIERE</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.requiere_evaluacion}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiere_evaluacion: checked })}
                />
                <Label>SE REQUIERE (INDICAR CANTIDAD, TIPO Y MOTIVO)</Label>
              </div>
              <Textarea
                rows={3}
                value={formData.necesidades_detalle}
                onChange={(e) => setFormData({ ...formData, necesidades_detalle: e.target.value })}
              />
            </div>
          </Card>

          {/* 7. NIVELES DE EMERGENCIA */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">7. NIVELES DE EMERGENCIA</Label>
            <div className="space-y-3 text-xs">
              <div>
                <Label className="font-semibold">Emergencia Menor:</Label>
                <p className="text-slate-600">situación con un nivel de afectación que permite ser gestionada con capacidades comunales...</p>
              </div>
              <div>
                <Label className="font-semibold">Emergencia Mayor:</Label>
                <p className="text-slate-600">situación con un nivel de afectación que permite ser gestionada con capacidades regionales...</p>
              </div>
              <div>
                <Label className="font-semibold">Desastre:</Label>
                <p className="text-slate-600">situación con un nivel de afectación e impacto que no permite ser gestionada con capacidades regionales...</p>
              </div>
              <div>
                <Label className="font-semibold">Catástrofe:</Label>
                <p className="text-slate-600">situación con un nivel de afectación e impacto que requiere de asistencia internacional...</p>
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-sm font-semibold mb-2 block">Nivel determinado:</Label>
              <Input
                value={formData.nivel_emergencia}
                onChange={(e) => setFormData({ ...formData, nivel_emergencia: e.target.value })}
                placeholder="Seleccione el nivel de emergencia"
              />
            </div>
          </Card>

          {/* 8. OBSERVACIONES */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">8. OBSERVACIONES</Label>
            <Textarea
              rows={4}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </Card>

          {/* 9. RESPONSABLE DEL INFORME */}
          <Card className="p-4 bg-slate-50">
            <Label className="font-bold text-base mb-3 block">9. RESPONSABLE DEL INFORME</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">IDENTIFICACIÓN:</Label>
                <Input
                  value={formData.responsable_nombre}
                  onChange={(e) => setFormData({ ...formData, responsable_nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">FECHA:</Label>
                <Input
                  value={formData.responsable_fecha}
                  onChange={(e) => setFormData({ ...formData, responsable_fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">HORA:</Label>
                <Input
                  value={formData.responsable_hora}
                  onChange={(e) => setFormData({ ...formData, responsable_hora: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Informe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}