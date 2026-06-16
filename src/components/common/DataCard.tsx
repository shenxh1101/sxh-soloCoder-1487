import { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  purple: 'from-violet-500 to-violet-600'
};

const iconBgClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-violet-50 text-violet-600'
};

export default function DataCard({ title, value, icon: Icon, trend, trendUp, color }: DataCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
          {trend && (
            <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${
              trendUp ? 'text-emerald-600' : 'text-red-500'
            }`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
              <span className="text-slate-400 text-xs ml-1">较上月</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBgClasses[color]} flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${colorClasses[color]} opacity-60`}></div>
    </div>
  );
}
