import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Search, Eye, CheckCircle, Clock, Package } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils/format';

type FilterStatus = 'all' | 'pending' | 'producing' | 'done';

export default function ProductionList() {
  const { productionOrders, updateProductionOrder } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const filteredOrders = productionOrders.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    pending: productionOrders.filter((p) => p.status === 'pending').length,
    producing: productionOrders.filter((p) => p.status === 'producing').length,
    done: productionOrders.filter((p) => p.status === 'done').length
  };

  const handleStatusChange = (id: string, status: 'producing' | 'done') => {
    updateProductionOrder(id, { status });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待生产', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'producing':
        return { label: '生产中', color: 'bg-blue-100 text-blue-700', icon: Package };
      case 'done':
        return { label: '已完成', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">生产单中心</h1>
          <p className="text-sm text-slate-500 mt-1">车间生产任务管理</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter('pending')}
          className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all ${
            statusFilter === 'pending' ? 'border-amber-400 shadow-md' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">待生产</div>
              <div className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter('producing')}
          className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all ${
            statusFilter === 'producing' ? 'border-blue-400 shadow-md' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">生产中</div>
              <div className="text-3xl font-bold text-blue-600 mt-1">{stats.producing}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter('done')}
          className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all ${
            statusFilter === 'done' ? 'border-emerald-400 shadow-md' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">已完成</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{stats.done}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索订单号、客户名称..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'pending', 'producing', 'done'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? '全部' : getStatusInfo(status).label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">订单号</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">客户</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">产品项</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">总数量</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用纸张数</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((po) => {
                  const statusInfo = getStatusInfo(po.status);
                  const StatusIcon = statusInfo.icon;
                  const totalQty = po.items.reduce((sum, i) => sum + i.quantity, 0);
                  const totalSheets = po.items.reduce((sum, i) => sum + i.sheetsNeeded, 0);

                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800 text-sm">{po.orderNo}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800 text-sm">{po.customerName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{po.items.length} 项</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">{totalQty.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">{totalSheets} 张</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-500">{formatDateTime(po.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/production/${po.id}`}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {po.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(po.id, 'producing')}
                              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="开始生产"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          )}
                          {po.status === 'producing' && (
                            <button
                              onClick={() => handleStatusChange(po.id, 'done')}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="完成生产"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                    暂无生产单数据
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
