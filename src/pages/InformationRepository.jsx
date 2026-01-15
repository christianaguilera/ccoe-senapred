import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText, Download, ExternalLink, FolderOpen, Book, FileWarning, Database } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../components/contexts/ThemeContext';

export default function InformationRepository() {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      name: 'Protocolos y Procedimientos',
      icon: FileText,
      color: 'blue',
      documents: [
        { title: 'Protocolo SCI - Sistema Comando Incidentes', url: 'https://senapred.cl/wp-content/uploads/2023/03/Protocolo-SCI.pdf', type: 'PDF' },
        { title: 'Manual Básico SCI', url: 'https://senapred.cl/informate/sistema-de-comando-de-incidentes/', type: 'Web' },
        { title: 'Procedimientos de Evacuación', url: '#', type: 'PDF' },
        { title: 'Protocolos de Comunicación de Emergencia', url: '#', type: 'PDF' }
      ]
    },
    {
      name: 'Planes de Emergencia',
      icon: FolderOpen,
      color: 'orange',
      documents: [
        { title: 'Plan Nacional de Protección Civil', url: 'https://senapred.cl/plan-nacional-de-proteccion-civil/', type: 'Web' },
        { title: 'Planes Regionales de Emergencia', url: '#', type: 'PDF' },
        { title: 'Plan de Respuesta a Incendios Forestales', url: '#', type: 'PDF' },
        { title: 'Plan de Respuesta a Terremotos y Tsunamis', url: '#', type: 'PDF' }
      ]
    },
    {
      name: 'Capacitación y Guías',
      icon: Book,
      color: 'green',
      documents: [
        { title: 'Guía de Autocuidado en Emergencias', url: 'https://senapred.cl/recomendaciones/', type: 'Web' },
        { title: 'Manual de Primeros Auxilios Básicos', url: '#', type: 'PDF' },
        { title: 'Capacitación SCI para Personal de Emergencias', url: '#', type: 'PDF' },
        { title: 'Guía de Preparación Familiar', url: '#', type: 'PDF' }
      ]
    },
    {
      name: 'Alertas y Avisos',
      icon: FileWarning,
      color: 'red',
      documents: [
        { title: 'Sistema de Alerta Temprana - SAT', url: 'https://senapred.cl/sistema-de-alerta-temprana/', type: 'Web' },
        { title: 'Protocolo de Alertas Meteorológicas', url: '#', type: 'PDF' },
        { title: 'Guía de Interpretación de Alertas', url: '#', type: 'PDF' },
        { title: 'Red Nacional de Alertas', url: '#', type: 'Web' }
      ]
    },
    {
      name: 'Base de Datos y Estadísticas',
      icon: Database,
      color: 'purple',
      documents: [
        { title: 'Histórico de Emergencias en Chile', url: '#', type: 'Excel' },
        { title: 'Estadísticas de Incendios Forestales', url: '#', type: 'PDF' },
        { title: 'Base de Datos Sísmica Nacional', url: 'https://www.sismologia.cl/', type: 'Web' },
        { title: 'Registro de Recursos de Emergencia', url: '#', type: 'Excel' }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    documents: category.documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.documents.length > 0);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        border: 'border-blue-500',
        icon: 'text-blue-500',
        badge: isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
        border: 'border-orange-500',
        icon: 'text-orange-500',
        badge: isDarkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
      },
      green: {
        bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
        border: 'border-green-500',
        icon: 'text-green-500',
        badge: isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
      },
      red: {
        bg: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
        border: 'border-red-500',
        icon: 'text-red-500',
        badge: isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
      },
      purple: {
        bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        border: 'border-purple-500',
        icon: 'text-purple-500',
        badge: isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={cn(
      "min-h-screen -m-8 p-8 space-y-6 transition-colors duration-300",
      isDarkMode ? "bg-slate-950" : "bg-slate-100"
    )}>
      {/* Header */}
      <div className={cn(
        "flex flex-col gap-4 pb-4 border-b",
        isDarkMode ? "border-slate-800" : "border-slate-300"
      )}>
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            REPOSITORIO DE INFORMACIÓN
          </h1>
          <p className={cn(
            "text-sm mt-1",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Documentación, protocolos y recursos de emergencia
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5",
            isDarkMode ? "text-slate-500" : "text-slate-400"
          )} />
          <Input
            placeholder="Buscar documentos, protocolos, guías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "pl-10",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
            )}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <Card className={cn(
            "p-12 text-center",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
          )}>
            <FileText className={cn(
              "w-16 h-16 mx-auto mb-4",
              isDarkMode ? "text-slate-700" : "text-slate-300"
            )} />
            <p className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-slate-400" : "text-slate-600"
            )}>
              No se encontraron documentos
            </p>
            <p className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-slate-500" : "text-slate-500"
            )}>
              Intenta con otros términos de búsqueda
            </p>
          </Card>
        ) : (
          filteredCategories.map((category) => {
            const Icon = category.icon;
            const colorClasses = getColorClasses(category.color);
            
            return (
              <Card key={category.name} className={cn(
                "p-6",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-3 rounded-lg border-2",
                    colorClasses.bg,
                    colorClasses.border
                  )}>
                    <Icon className={cn("w-6 h-6", colorClasses.icon)} />
                  </div>
                  <div>
                    <h2 className={cn(
                      "text-xl font-bold",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {category.name}
                    </h2>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-slate-500" : "text-slate-500"
                    )}>
                      {category.documents.length} documento{category.documents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all hover:shadow-md group",
                        isDarkMode 
                          ? "bg-slate-800/50 border-slate-700 hover:border-slate-600" 
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-semibold text-sm mb-1 group-hover:text-orange-500 transition-colors",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>
                            {doc.title}
                          </h3>
                          <Badge className={cn("text-xs", colorClasses.badge)}>
                            {doc.type}
                          </Badge>
                        </div>
                        <ExternalLink className={cn(
                          "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                          isDarkMode ? "text-slate-400" : "text-slate-600"
                        )} />
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Links Footer */}
      <Card className={cn(
        "p-6",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
      )}>
        <h3 className={cn(
          "text-lg font-bold mb-4",
          isDarkMode ? "text-white" : "text-slate-900"
        )}>
          Enlaces Rápidos SENAPRED
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="https://senapred.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-3 rounded-lg border flex items-center gap-2 hover:bg-orange-50 transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
            )}
          >
            <ExternalLink className="w-4 h-4 text-orange-500" />
            <span className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              Portal SENAPRED
            </span>
          </a>
          <a
            href="https://senapred.cl/recomendaciones/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-3 rounded-lg border flex items-center gap-2 hover:bg-orange-50 transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
            )}
          >
            <ExternalLink className="w-4 h-4 text-orange-500" />
            <span className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              Recomendaciones
            </span>
          </a>
          <a
            href="https://senapred.cl/alertas/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-3 rounded-lg border flex items-center gap-2 hover:bg-orange-50 transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
            )}
          >
            <ExternalLink className="w-4 h-4 text-orange-500" />
            <span className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              Alertas Vigentes
            </span>
          </a>
          <a
            href="https://www.arcgis.com/apps/webappviewer/index.html?id=5062b40cc3e347c8b11fd8b20a639a88"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-3 rounded-lg border flex items-center gap-2 hover:bg-orange-50 transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
            )}
          >
            <ExternalLink className="w-4 h-4 text-orange-500" />
            <span className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              Visor Chile Preparado
            </span>
          </a>
        </div>
      </Card>
    </div>
  );
}