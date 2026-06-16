import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  DollarSign,
  Printer,
  Users,
  PlusCircle,
  ArrowRight,
  FileText,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import DataCard from '@/components/common/DataCard';
import { useAppStore } from '@/store';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PRODUCT_TYPE_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export default function Dashboard() {
  const { orders, customers, productionOrders } = useAppStore();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const today = formatDate(now);

    const todayOrders = orders.filter((o) => formatDate(o.createdAt) === today);
    const thisMonthOrders = orders.filter(
      (o) => new Date(o.createdAt).getMonth() === thisMonth && new Date(o.createdAt).getFullYear() === thisYear
    );
    const pendingProduction = productionOrders.filter((p) => p.status !== 'done');
    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      todayOrders: todayOrders.length,
      thisMonthOrders: thisMonthOrders.length,
      pendingProduction: pendingProduction.length,
      thisMonthRevenue,
      totalCustomers: customers.length
    };
  }, [orders, customers, productionOrders]);

  const monthlyData = useMemo(() => {
    const months: { name: string; orders: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthOrders = orders.filter(
        (o) => new Date(o.createdAt).getMonth() === month && new Date(o.createdAt).getFullYear() === year
      );
      months.push({
        name: `${month + 1}月`,
        orders: monthOrders.length,
        revenue: +monthOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)
      });
    }
    return months;
  }, [orders]);

  const productTypeData = useMemo(() => {
    const counts: Record<string, number> = { business_card: 0, flyer: 0, sticker: 0 };
    orders.forEach((o) => {
      o.items.forEach((item) => {
        counts[item.productType] = (counts[item.productType] || 0) + 1;
      });
    });
    const COLORS = ['#F59E0B', '#3B82F6', '#10B981'];
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v], i) => ({
        name: PRODUCT_TYPE_LABELS[k as keyof typeof PRODUCT_TYPE_LABELS] || k,
        value: v,
        color: COLORS[i % COLORS.length]
      }));
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
          <p className="text-sm text-slate-500 mt-1">印刷店今日运营概览</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-200"
        >
          <PlusCircle className="w-5 h-5" />
          新建订单
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <DataCard
          title="今日订单"
          value={stats.todayOrders}
          icon={ClipboardList}
          color="blue"
          trend="3笔"
          trendUp
        />
        <DataCard
          title="本月收入"
          value={formatCurrency(stats.thisMonthRevenue)}
          icon={DollarSign}
          color="green"
          trend="15.3%"
          trendUp
        />
        <DataCard
          title="待生产"
          value={stats.pendingProduction}
          icon={Printer}
          color="amber"
          trend="2笔"
          trendUp={false}
        />
        <DataCard
          title="累计客户"
          value={stats.totalCustomers}
          icon={Users}
          color="purple"
          trend="5位"
          trendUp
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">月度订单与收入</h3>
            <span className="text-xs text-slate-400">近6个月</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar yAxisId="left" dataKey="orders" name="订单数" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar yAxisId="right" dataKey="revenue" name="收入(元)" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">产品类型分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={productTypeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {productTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">最近订单</h3>
            <Link to="/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{order.orderNo}</div>
                      <div className="text-xs text-slate-500">{order.customerName} · {formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{formatCurrency(order.totalAmount)}</div>
                      <div className="text-xs text-slate-400">{order.items.length}项产品</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">暂无订单数据</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            快捷操作
          </h3>
          <div className="space-y-3">
            <Link
              to="/orders/new"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">新建订单</div>
                <div className="text-xs text-slate-500">快速录入客户订单</div>
              </div>
            </Link>
            <Link
              to="/production"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">生产单中心</div>
                <div className="text-xs text-slate-500">查看待生产任务</div>
              </div>
            </Link>
            <Link
              to="/customers"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">客户管理</div>
                <div className="text-xs text-slate-500">查看客户历史记录</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
