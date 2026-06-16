import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PRODUCT_TYPE_LABELS,
  type OrderStatus
} from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';

const STATUS_FILTERS: (OrderStatus | 'all')[] = ['all', 'draft', 'quoted', 'confirmed', 'in_production', 'completed', 'cancelled'];

export default function OrderList() {
  const { orders } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !searchTerm ||
        o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.includes(searchTerm) ||
        o.customerPhone.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const today = formatDate(new Date());
    const todayCount = orders.filter((o) => formatDate(o.createdAt) === today).length;
    const pending = orders.filter((o) => o.status === 'confirmed' || o.status === 'in_production').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'draft')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, todayCount, pending, revenue };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">订单列表</h1>
          <p className="text-sm text-slate-500 mt-1">管理所有客户订单</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          新建订单
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="text-sm text-slate-500">订单总数</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="text-sm text-slate-500">今日新增</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.todayCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="text-sm text-slate-500">待处理</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="text-sm text-slate-500">累计营收</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.revenue)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索订单号、客户名称、电话..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === status
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? '全部' : ORDER_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">订单号</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">客户</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">产品</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">数量</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">金额</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 text-sm">{order.orderNo}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {order.items.slice(0, 2).map((item) => (
                          <span key={item.id} className="text-xs text-slate-600">
                            {PRODUCT_TYPE_LABELS[item.productType]} · {item.paperWeight}g
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-xs text-slate-400">+{order.items.length - 2}项</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700 font-medium">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/orders/${order.id}`}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                    暂无订单数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
