import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Printer,
  Users,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/orders', icon: ClipboardList, label: '订单列表' },
  { path: '/orders/new', icon: PlusCircle, label: '新建订单' },
  { path: '/production', icon: Printer, label: '生产单' },
  { path: '/customers', icon: Users, label: '客户管理' }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } bg-gradient-to-b from-slate-800 to-slate-900 text-white min-h-screen flex flex-col transition-all duration-300 relative`}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-700 px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wide whitespace-nowrap">印刷通</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">PrintShop ERP</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
