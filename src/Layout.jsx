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

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: createPageUrl('Dashboard'), icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Incidentes', href: createPageUrl('Incidents'), icon: AlertTriangle, page: 'Incidents' },
    { name: 'Mapa', href: createPageUrl('IncidentMap'), icon: MapPin, page: 'IncidentMap' },
    { name: 'Estructura ICS', href: createPageUrl('ICSStructure'), icon: Users, page: 'ICSStructure' },
    { name: 'Recursos', href: createPageUrl('Resources'), icon: Package, page: 'Resources' },
    { name: 'Reportes', href: createPageUrl('Reports'), icon: FileText, page: 'Reports' },
  ];

  const archiveNavigation = [
    { name: 'Archivo de Incidentes', href: createPageUrl('DeletedIncidents'), icon: Archive, page: 'DeletedIncidents' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 transform transition-transform duration-300 ease-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">ICS Command</h1>
              <p className="text-xs text-slate-400">Sistema de Incidentes</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto lg:hidden text-slate-400"
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
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "text-orange-400")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Archive Section */}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">
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
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "text-orange-400")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">v1.0 · ICS Protocol</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 ml-auto">
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