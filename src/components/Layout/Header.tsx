import { Bell, Search, Settings, User } from 'lucide-react';

export default function Header() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索订单、客户..."
            className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-500 font-medium">{dateStr}</div>

        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors group">
          <Settings className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
        </button>

        <div className="w-px h-8 bg-slate-200"></div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">管理员</span>
            <span className="text-xs text-slate-500">店主</span>
          </div>
        </div>
      </div>
    </header>
  );
}
