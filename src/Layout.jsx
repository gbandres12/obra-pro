
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Building2, 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Package, 
  Calculator,
  Menu,
  X,
  DollarSign,
  ClipboardList,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    title: 'Dashboard',
    url: createPageUrl('Dashboard'),
    icon: LayoutDashboard,
  },
  {
    title: 'Obras',
    url: createPageUrl('Obras'),
    icon: Building2,
  },
  {
    title: 'Financeiro',
    url: createPageUrl('Financeiro'),
    icon: DollarSign,
  },
  {
    title: 'Etapas',
    url: createPageUrl('Etapas'),
    icon: CheckSquare,
  },
  {
    title: 'Tarefas',
    url: createPageUrl('Tarefas'),
    icon: CalendarCheck,
  },
  {
    title: 'Solicitações',
    url: createPageUrl('Solicitacoes'),
    icon: ClipboardList,
  },
  {
    title: 'Equipe',
    url: createPageUrl('Equipe'),
    icon: Users,
  },
  {
    title: 'Materiais',
    url: createPageUrl('Materiais'),
    icon: Package,
  },
  {
    title: 'Orçamentos',
    url: createPageUrl('Orcamentos'),
    icon: Calculator,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const isObraDashboard = currentPageName === 'ObraDashboard';

  if (isObraDashboard) {
      return <main>{children}</main>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Engenheiro de Bolso</h2>
                <p className="text-xs text-gray-500">Gestão de Obras</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                      isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2024 Engenheiro de Bolso
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm border-b border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">{currentPageName}</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
