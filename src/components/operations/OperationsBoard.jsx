import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Download, Plus, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ICSStructureView from '../incidents/ICSStructureView';
import IncidentMap from '../maps/IncidentMap';

export default function OperationsBoard({ open, onClose, incident, staff = [] }) {
  const boardRef = useRef(null);
  const [boardData, setBoardData] = useState({
    tipo_emergencia: incident?.name || '',
    fecha: format(new Date(), "dd-MM-yyyy"),
    hora: format(new Date(), "HH:mm"),
    direccion: incident?.location || '',
    coordenadas: incident?.coordinates ? `${incident.coordinates.lat}, ${incident.coordinates.lng}` : '',
    objetivos: ['', '', ''],
    estrategias: ['', '', ''],
    tacticas: ['', '', ''],
    instituciones: {
      comandante_operaciones: false,
      of_enlace: false,
      inf_publica: false,
      operaciones: false,
      of_seguridad: false,
      delegacion_presidencial: false,
      planificacion: false,
      gobierno_regional: false,
      logistica: false,
      org_tecnico_1: false,
      adm_finanzas: false,
      org_tecnico_2: false,
      enlace: false,
      org_tecnico_3: false
    },
    puesto_comando: {
      ubicacion: '',
      oficial: incident?.incident_commander || ''
    },
    perimetros: {
      ubicacion_seguridad: '',
      institucion_seguridad: '',
      ubicacion_otro: '',
      institucion_otro: ''
    },
    condiciones: {
      hora: format(new Date(), "HH:mm"),
      temperatura: '',
      humedad: '',
      velocidad_viento: '',
      direccion_viento: '',
      agua: '',
      electricidad: '',
      sanitario: '',
      telecomunicaciones: '',
      internet: ''
    },
    evacuaciones: [
      { localidad: '', sae: '', activacion_sirenas: '', asistida: '' }
    ],
    escenario_imagen: '',
    sectores: [
      { sector: '', oficial: '' }
    ],
    asignaciones: [
      { unidad: '', personal: '', sector: '', tarea: '' }
    ]
  });

  const handleAddItem = (field) => {
    setBoardData({
      ...boardData,
      [field]: [...boardData[field], field === 'objetivos' || field === 'estrategias' || field === 'tacticas' ? '' : 
        field === 'evacuaciones' ? { localidad: '', sae: '', activacion_sirenas: '', asistida: '' } :
        field === 'sectores' ? { sector: '', oficial: '' } :
        { unidad: '', personal: '', sector: '', tarea: '' }]
    });
  };

  const handleRemoveItem = (field, index) => {
    const newItems = boardData[field].filter((_, i) => i !== index);
    setBoardData({ ...boardData, [field]: newItems });
  };

  const handleItemChange = (field, index, value) => {
    const newItems = [...boardData[field]];
    newItems[index] = value;
    setBoardData({ ...boardData, [field]: newItems });
  };

  const handleNestedChange = (field, index, key, value) => {
    const newItems = [...boardData[field]];
    newItems[index][key] = value;
    setBoardData({ ...boardData, [field]: newItems });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = boardRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a3');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Tablero-Operaciones-${incident?.incident_number || 'incidente'}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Tablero de Comando - Operaciones</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="page1" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="page1">Tablero Principal</TabsTrigger>
            <TabsTrigger value="page2">Escenario de Operaciones</TabsTrigger>
          </TabsList>

          {/* Página 1 - Tablero Principal */}
          <TabsContent value="page1" className="space-y-4">
            <div ref={boardRef} className="bg-white p-6 space-y-6">
              {/* Header con fondo naranja */}
              <div className="grid grid-cols-12 gap-4">
                {/* Columna Izquierda - Datos de Emergencia */}
                <div className="col-span-3 space-y-4">
                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold text-lg mb-3">TIPO DE EMERGENCIA</h3>
                    <Textarea
                      value={boardData.tipo_emergencia}
                      onChange={(e) => setBoardData({ ...boardData, tipo_emergencia: e.target.value })}
                      className="bg-white text-slate-900"
                      rows={3}
                    />
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold mb-3">DATOS EMERGENCIA:</h3>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-white text-xs">FECHA:</Label>
                        <Input
                          value={boardData.fecha}
                          onChange={(e) => setBoardData({ ...boardData, fecha: e.target.value })}
                          className="bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">HORA:</Label>
                        <Input
                          value={boardData.hora}
                          onChange={(e) => setBoardData({ ...boardData, hora: e.target.value })}
                          className="bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">DIRECCIÓN:</Label>
                        <Input
                          value={boardData.direccion}
                          onChange={(e) => setBoardData({ ...boardData, direccion: e.target.value })}
                          className="bg-white text-slate-900"
                        />
                        <Input
                          value={boardData.coordenadas}
                          onChange={(e) => setBoardData({ ...boardData, coordenadas: e.target.value })}
                          className="bg-white text-slate-900 mt-1"
                          placeholder="Coordenadas"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">OBJETIVOS:</h3>
                      <Button size="sm" variant="ghost" className="text-white h-6" onClick={() => handleAddItem('objetivos')}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {boardData.objetivos.map((obj, idx) => (
                        <div key={idx} className="flex gap-1">
                          <span className="text-white text-sm">{idx + 1}.</span>
                          <Input
                            value={obj}
                            onChange={(e) => handleItemChange('objetivos', idx, e.target.value)}
                            className="bg-white text-slate-900 h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">ESTRATEGIAS:</h3>
                      <Button size="sm" variant="ghost" className="text-white h-6" onClick={() => handleAddItem('estrategias')}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {boardData.estrategias.map((est, idx) => (
                        <div key={idx} className="flex gap-1">
                          <span className="text-white text-sm">{idx + 1}.</span>
                          <Input
                            value={est}
                            onChange={(e) => handleItemChange('estrategias', idx, e.target.value)}
                            className="bg-white text-slate-900 h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">TÁCTICAS:</h3>
                      <Button size="sm" variant="ghost" className="text-white h-6" onClick={() => handleAddItem('tacticas')}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {boardData.tacticas.map((tac, idx) => (
                        <div key={idx} className="flex gap-1">
                          <span className="text-white text-sm">{idx + 1}.</span>
                          <Input
                            value={tac}
                            onChange={(e) => handleItemChange('tacticas', idx, e.target.value)}
                            className="bg-white text-slate-900 h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold mb-2">INSTITUCIONES</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.keys(boardData.instituciones).map((inst) => (
                        <label key={inst} className="flex items-center gap-1 text-white">
                          <input
                            type="checkbox"
                            checked={boardData.instituciones[inst]}
                            onChange={(e) => setBoardData({
                              ...boardData,
                              instituciones: { ...boardData.instituciones, [inst]: e.target.checked }
                            })}
                            className="w-3 h-3"
                          />
                          <span className="text-[10px]">{inst.replace(/_/g, ' ').toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Columna Centro - Staff de Comando */}
                <div className="col-span-5 space-y-4">
                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold mb-3">PUESTO DE COMANDO:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-white text-xs">UBICACIÓN:</Label>
                        <Input
                          value={boardData.puesto_comando.ubicacion}
                          onChange={(e) => setBoardData({
                            ...boardData,
                            puesto_comando: { ...boardData.puesto_comando, ubicacion: e.target.value }
                          })}
                          className="bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">OFICIAL:</Label>
                        <Input
                          value={boardData.puesto_comando.oficial}
                          onChange={(e) => setBoardData({
                            ...boardData,
                            puesto_comando: { ...boardData.puesto_comando, oficial: e.target.value }
                          })}
                          className="bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold mb-3">PERÍMETROS DE SEGURIDAD</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-white text-xs">UBICACIÓN:</Label>
                        <Input
                          value={boardData.perimetros.ubicacion_seguridad}
                          onChange={(e) => setBoardData({
                            ...boardData,
                            perimetros: { ...boardData.perimetros, ubicacion_seguridad: e.target.value }
                          })}
                          className="bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">INSTITUCIÓN:</Label>
                        <Input
                          value={boardData.perimetros.institucion_seguridad}
                          onChange={(e) => setBoardData({
                            ...boardData,
                            perimetros: { ...boardData.perimetros, institucion_seguridad: e.target.value }
                          })}
                          className="bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Organigrama Staff */}
                  <Card className="p-4 bg-slate-100">
                    <h3 className="font-semibold text-center mb-4">STAFF DE COMANDO</h3>
                    <div className="bg-white">
                      <ICSStructureView staff={staff} />
                    </div>
                  </Card>
                </div>

                {/* Columna Derecha - Condiciones y Evacuaciones */}
                <div className="col-span-4 space-y-4">
                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold mb-3">CONDICIONES CLIMÁTICAS</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-white text-[10px]">HORA:</Label>
                          <Input value={boardData.condiciones.hora} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, hora: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                        </div>
                        <div>
                          <Label className="text-white text-[10px]">TEMP:</Label>
                          <Input value={boardData.condiciones.temperatura} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, temperatura: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                        </div>
                        <div>
                          <Label className="text-white text-[10px]">HUM:</Label>
                          <Input value={boardData.condiciones.humedad} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, humedad: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-white text-[10px]">VEL. VIENTO:</Label>
                          <Input value={boardData.condiciones.velocidad_viento} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, velocidad_viento: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                        </div>
                        <div>
                          <Label className="text-white text-[10px]">DIR. VIENTO:</Label>
                          <Input value={boardData.condiciones.direccion_viento} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, direccion_viento: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <h3 className="font-bold mb-2 text-sm">SERVICIOS BÁSICOS</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <Label className="text-white text-[10px]">AGUA:</Label>
                        <Input value={boardData.condiciones.agua} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, agua: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-white text-[10px]">ELEC.:</Label>
                        <Input value={boardData.condiciones.electricidad} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, electricidad: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-white text-[10px]">SANIT.:</Label>
                        <Input value={boardData.condiciones.sanitario} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, sanitario: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-white text-[10px]">TELEC.:</Label>
                        <Input value={boardData.condiciones.telecomunicaciones} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, telecomunicaciones: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-white text-[10px]">INTERNET:</Label>
                        <Input value={boardData.condiciones.internet} onChange={(e) => setBoardData({...boardData, condiciones: {...boardData.condiciones, internet: e.target.value}})} className="bg-white text-slate-900 h-7 text-xs" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-500 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm">EVACUACIONES</h3>
                      <Button size="sm" variant="ghost" className="text-white h-6" onClick={() => handleAddItem('evacuaciones')}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {boardData.evacuaciones.map((evac, idx) => (
                        <div key={idx} className="border border-white/30 rounded p-2 space-y-1">
                          <div className="grid grid-cols-2 gap-1">
                            <Input
                              placeholder="Localidad"
                              value={evac.localidad}
                              onChange={(e) => handleNestedChange('evacuaciones', idx, 'localidad', e.target.value)}
                              className="bg-white text-slate-900 h-6 text-xs"
                            />
                            <Input
                              placeholder="SAE"
                              value={evac.sae}
                              onChange={(e) => handleNestedChange('evacuaciones', idx, 'sae', e.target.value)}
                              className="bg-white text-slate-900 h-6 text-xs"
                            />
                            <Input
                              placeholder="Sirenas"
                              value={evac.activacion_sirenas}
                              onChange={(e) => handleNestedChange('evacuaciones', idx, 'activacion_sirenas', e.target.value)}
                              className="bg-white text-slate-900 h-6 text-xs"
                            />
                            <Input
                              placeholder="Asistida"
                              value={evac.asistida}
                              onChange={(e) => handleNestedChange('evacuaciones', idx, 'asistida', e.target.value)}
                              className="bg-white text-slate-900 h-6 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Página 2 - Escenario de Operaciones */}
          <TabsContent value="page2" className="space-y-4">
            <div className="bg-white p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Escenario con imagen */}
                <div className="col-span-2 space-y-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-3">ESCENARIO DE OPERACIONES</h3>
                    
                    {/* Sectores */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {boardData.sectores.map((sector, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">SECTOR:</Label>
                            {idx > 0 && (
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleRemoveItem('sectores', idx)}>
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={sector.sector}
                            onChange={(e) => handleNestedChange('sectores', idx, 'sector', e.target.value)}
                            className="h-7 text-xs text-center font-bold"
                            placeholder="A"
                          />
                          <Label className="text-xs">OFICIAL:</Label>
                          <Input
                            value={sector.oficial}
                            onChange={(e) => handleNestedChange('sectores', idx, 'oficial', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => handleAddItem('sectores')} className="h-7">
                        <Plus className="w-3 h-3 mr-1" />
                        Sector
                      </Button>
                    </div>

                    {/* Mapa del escenario */}
                    {incident?.coordinates?.lat && incident?.coordinates?.lng ? (
                      <IncidentMap
                        incidents={[incident]}
                        selectedIncident={incident}
                        height="450px"
                        showRadius={true}
                        incidentId={incident.id}
                        enablePOI={true}
                      />
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 min-h-[400px] bg-slate-50 flex flex-col items-center justify-center">
                        <Upload className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-slate-500 text-sm">Sin coordenadas del incidente</p>
                        <p className="text-slate-400 text-xs">(Configure ubicación en detalles del incidente)</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Asignaciones */}
                <div className="space-y-4">
                  <Card className="p-4 bg-yellow-400">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">ASIGNACIÓN O TAREA</h3>
                      <Button size="sm" variant="ghost" className="h-6" onClick={() => handleAddItem('asignaciones')}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {boardData.asignaciones.map((asig, idx) => (
                        <div key={idx} className="border-2 border-slate-800 rounded p-2 bg-white space-y-1">
                          <div className="grid grid-cols-3 gap-1">
                            <Input
                              placeholder="Unidad"
                              value={asig.unidad}
                              onChange={(e) => handleNestedChange('asignaciones', idx, 'unidad', e.target.value)}
                              className="h-6 text-xs"
                            />
                            <Input
                              placeholder="N° Pers."
                              value={asig.personal}
                              onChange={(e) => handleNestedChange('asignaciones', idx, 'personal', e.target.value)}
                              className="h-6 text-xs"
                            />
                            <Input
                              placeholder="Sector"
                              value={asig.sector}
                              onChange={(e) => handleNestedChange('asignaciones', idx, 'sector', e.target.value)}
                              className="h-6 text-xs"
                            />
                          </div>
                          <Textarea
                            placeholder="Tarea asignada..."
                            value={asig.tarea}
                            onChange={(e) => handleNestedChange('asignaciones', idx, 'tarea', e.target.value)}
                            className="text-xs"
                            rows={2}
                          />
                          {idx > 0 && (
                            <Button variant="ghost" size="sm" className="h-5 w-full" onClick={() => handleRemoveItem('asignaciones', idx)}>
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600">
            Guardar Tablero
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}