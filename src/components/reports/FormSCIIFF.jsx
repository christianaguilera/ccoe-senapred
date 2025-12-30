import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function FormSCIIFF({ open, onClose, incident }) {
  const [formData, setFormData] = useState({
    nombre_incendio: incident?.name || '',
    fecha: format(new Date(), 'dd/MM/yyyy'),
    region: incident?.region || '',
    comuna: incident?.comuna || '',
    comandante_incidente: incident?.incident_commander || '',
    institucion_comandante: '',
  });

  const [participantes, setParticipantes] = useState([
    { nombre: '', institucion: '', cargo: '', medio_contacto: '', llegada: '', salida: '' }
  ]);

  const addParticipante = () => {
    setParticipantes([...participantes, { 
      nombre: '', 
      institucion: '', 
      cargo: '', 
      medio_contacto: '', 
      llegada: '', 
      salida: '' 
    }]);
  };

  const removeParticipante = (index) => {
    setParticipantes(participantes.filter((_, i) => i !== index));
  };

  const updateParticipante = (index, field, value) => {
    const updated = [...participantes];
    updated[index][field] = value;
    setParticipantes(updated);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ANEXO "E"', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('LISTADO DE PARTICIPANTES EN PUESTO DE COMANDO UNIFICADO', 105, 28, { align: 'center' });
    
    // Información del incidente
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre Incendio: ${formData.nombre_incendio}`, 15, 40);
    doc.text(`Fecha: ${formData.fecha}`, 140, 40);
    doc.text(`Región: ${formData.region}`, 15, 46);
    doc.text(`Comuna: ${formData.comuna}`, 140, 46);
    doc.text(`Comandante Incidente: ${formData.comandante_incidente}`, 15, 52);
    doc.text(`Institución: ${formData.institucion_comandante}`, 15, 58);
    
    // Tabla de participantes - Manual
    doc.setFontSize(8);
    let y = 70;
    
    // Encabezados
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(220, 53, 69);
    doc.rect(15, y, 180, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Nombre', 17, y + 5);
    doc.text('Institución', 50, y + 5);
    doc.text('Cargo', 80, y + 5);
    doc.text('Contacto', 105, y + 5);
    doc.text('Llegada', 130, y + 5);
    doc.text('Salida', 165, y + 5);
    
    // Datos
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    y += 7;
    
    participantes.forEach((p, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const rowColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
      doc.setFillColor(...rowColor);
      doc.rect(15, y, 180, 7, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, y, 180, 7, 'S');
      
      doc.text(p.nombre.substring(0, 15), 17, y + 5);
      doc.text(p.institucion.substring(0, 12), 50, y + 5);
      doc.text(p.cargo.substring(0, 12), 80, y + 5);
      doc.text(p.medio_contacto.substring(0, 12), 105, y + 5);
      doc.text(p.llegada.substring(0, 16), 130, y + 5);
      doc.text(p.salida.substring(0, 16), 165, y + 5);
      
      y += 7;
    });

    doc.save(`SCI-IFF_Participantes_${formData.nombre_incendio}_${Date.now()}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-4 right-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/7a21f602a_LogoTripartito.jpg" 
            alt="Logo Tripartito"
            className="h-12 object-contain"
          />
        </div>
        <DialogHeader className="pt-8">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Anexo "E" Listado de Participantes en Puesto de Comando Unificado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Información General */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Información General</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre Incendio</Label>
                <Input
                  value={formData.nombre_incendio}
                  onChange={(e) => setFormData({ ...formData, nombre_incendio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Región</Label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Comuna</Label>
                <Input
                  value={formData.comuna}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Comandante Incidente</Label>
                <Input
                  value={formData.comandante_incidente}
                  onChange={(e) => setFormData({ ...formData, comandante_incidente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Institución Comandante</Label>
                <Input
                  value={formData.institucion_comandante}
                  onChange={(e) => setFormData({ ...formData, institucion_comandante: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Listado de Participantes */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Participantes en Puesto de Comando</h3>
              <Button onClick={addParticipante} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Participante
              </Button>
            </div>

            <div className="space-y-4">
              {participantes.map((participante, index) => (
                <Card key={index} className="p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm">Participante #{index + 1}</h4>
                    {participantes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipante(index)}
                        className="h-6 w-6 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        value={participante.nombre}
                        onChange={(e) => updateParticipante(index, 'nombre', e.target.value)}
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Institución</Label>
                      <Input
                        value={participante.institucion}
                        onChange={(e) => updateParticipante(index, 'institucion', e.target.value)}
                        placeholder="Institución"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Cargo</Label>
                      <Input
                        value={participante.cargo}
                        onChange={(e) => updateParticipante(index, 'cargo', e.target.value)}
                        placeholder="Cargo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Medio de contacto</Label>
                      <Input
                        value={participante.medio_contacto}
                        onChange={(e) => updateParticipante(index, 'medio_contacto', e.target.value)}
                        placeholder="Teléfono/Radio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Día y Horario llegada</Label>
                      <Input
                        type="datetime-local"
                        value={participante.llegada}
                        onChange={(e) => updateParticipante(index, 'llegada', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Día y Horario salida</Label>
                      <Input
                        type="datetime-local"
                        value={participante.salida}
                        onChange={(e) => updateParticipante(index, 'salida', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={exportToPDF} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}