import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Package, 
  Menu, 
  X,
  Shield,
  Bell,
  MapPin,
  FileText,
  Archive
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NotificationBell from './components/notifications/NotificationBell';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './components/contexts/ThemeContext';

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: createPageUrl('Dashboard'), icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Incidentes', href: createPageUrl('Incidents'), icon: AlertTriangle, page: 'Incidents' },
    { name: 'Mapa', href: createPageUrl('IncidentMap'), icon: MapPin, page: 'IncidentMap' },
    { name: 'Plan de Enlace Regional', href: createPageUrl('RegionalLinkPlan'), icon: Users, page: 'RegionalLinkPlan' },
    { name: 'Recursos', href: createPageUrl('Resources'), icon: Package, page: 'Resources' },
    { name: 'Reportes', href: createPageUrl('Reports'), icon: FileText, page: 'Reports' },
    { name: 'Notificaciones', href: createPageUrl('NotificationRules'), icon: Bell, page: 'NotificationRules' },
  ];

  const archiveNavigation = [
    { name: 'Archivo de Incidentes', href: createPageUrl('DeletedIncidents'), icon: Archive, page: 'DeletedIncidents' },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-zinc-950" : "bg-slate-50"
    )}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 transform transition-all duration-300 ease-out lg:translate-x-0",
        isDarkMode ? "bg-zinc-900" : "bg-white border-r border-slate-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 px-6 py-6 border-b",
            isDarkMode ? "border-zinc-800" : "border-slate-200"
          )}>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ed54b1d1364757e1b5450/b5ac78cc1_LogoSENAPRED.png" 
              alt="SENAPRED Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className={cn(
                "text-lg font-bold tracking-tight",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>ICS Command</h1>
              <p className={cn(
                "text-xs",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}>Sistema de Incidentes</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "ml-auto lg:hidden",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
                        : isDarkMode
                        ? "text-slate-400 hover:text-white hover:bg-zinc-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "text-orange-400")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Archive Section */}
            <div className={cn(
              "pt-4 mt-4 border-t",
              isDarkMode ? "border-zinc-800" : "border-slate-200"
            )}>
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wider px-4 mb-2",
                isDarkMode ? "text-slate-500" : "text-slate-500"
              )}>
                Archivo
              </p>
              <div className="space-y-1.5">
                {archiveNavigation.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
                          : isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-zinc-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "text-orange-400")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recomendaciones SENAPRED */}
            <div className="pt-4 mt-4 border-t">
              <a
                href="https://senapred.cl/recomendaciones/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-zinc-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <FileText className="w-5 h-5" />
                Recomendaciones SENAPRED
              </a>
              <a
                href="https://www.arcgis.com/apps/webappviewer/index.html?id=5062b40cc3e347c8b11fd8b20a639a88"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-zinc-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <MapPin className="w-5 h-5" />
                Mapa ArcGIS
              </a>
            </div>
            </nav>

            {/* Footer */}
          <div className={cn(
            "px-6 py-4 border-t",
            isDarkMode ? "border-zinc-800" : "border-slate-200"
          )}>
            <p className="text-xs text-slate-500">v1.0 · ICS Protocol</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-300",
          isDarkMode 
            ? "bg-zinc-900/80 border-zinc-800" 
            : "bg-white/80 border-slate-200/50"
        )}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "lg:hidden",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 ml-auto">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </ThemeProvider>
  );
}