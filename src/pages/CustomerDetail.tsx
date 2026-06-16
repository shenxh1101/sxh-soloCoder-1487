import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Tag,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from 'recharts';
import { useAppStore } from '@/store';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PRODUCT_TYPE_LABELS,
  PAPER_TYPE_LABELS
} from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, orders, isLoading } = useAppStore();

  const customer = customers.find((c) => c.id === id);
  const customerId = customer?.id;

  const customerOrders = useMemo(
    () => customerId ? orders.filter((o) => o.customerId === customerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [],
    [orders, customerId]
  );

  const validOrders = customerOrders.filter((o) => o.status !== 'cancelled' && o.status !== 'draft');

  const stats = useMemo(() => {
    const totalSpent = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = validOrders.length > 0 ? totalSpent / validOrders.length : 0;

    const now = new Date();
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const lastYearOrders = customerOrders.filter(
      (o) => new Date(o.createdAt) >= lastYear && o.status !== 'cancelled' && o.status !== 'draft'
    );
    const lastYearSpent = lastYearOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders: customerOrders.length,
      validOrders: validOrders.length,
      totalSpent,
      avgOrderValue,
      lastYearOrders: lastYearOrders.length,
      lastYearSpent
    };
  }, [customerOrders, validOrders]);

  const productDistribution = useMemo(() => {
    const counts: Record<string, { name: string; value: number; color: string }> = {};
    const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];
    validOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = PRODUCT_TYPE_LABELS[item.productType];
        if (!counts[key]) {
          counts[key] = { name: key, value: 0, color: colors[Object.keys(counts).length % colors.length] };
        }
        counts[key].value += item.quantity;
      });
    });
    return Object.values(counts);
  }, [validOrders]);

  const paperDistribution = useMemo(() => {
    const specSet = new Set<string>();
    validOrders.forEach((order) => {
      order.items.forEach((item) => {
        const spec = `${PAPER_TYPE_LABELS[item.paperType]} ${item.paperWeight}g`;
        specSet.add(spec);
      });
    });
    return Array.from(specSet).slice(0, 8);
  }, [validOrders]);

  const sizeDistribution = useMemo(() => {
    const specSet = new Set<string>();
    validOrders.forEach((order) => {
      order.items.forEach((item) => {
        specSet.add(`${item.finishedWidth}×${item.finishedHeight}mm`);
      });
    });
    return Array.from(specSet).slice(0, 8);
  }, [validOrders]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    validOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + order.totalAmount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([k, v]) => ({ name: k.slice(5) + '月', revenue: +v.toFixed(0) }));
  }, [validOrders]);

  const chartColors = productDistribution.map((p) => p.color);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">加载客户数据中...</p>
        <p className="text-slate-400 text-sm mt-1">请稍候</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 p-16">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">未找到该客户</h2>
          <p className="text-slate-500 mb-6 text-center">
            客户信息可能已被删除，或访问链接有误
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customers')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              返回客户列表
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
            >
              返回上一页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{customer.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {customer.phone}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {customer.email}
                </span>
              )}
              {customer.address && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {customer.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">累计订单</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.totalOrders}</div>
          <div className="text-xs text-slate-400 mt-1">有效订单 {stats.validOrders} 笔</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">累计消费</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalSpent)}</div>
          <div className="text-xs text-slate-400 mt-1">客单价 {formatCurrency(stats.avgOrderValue)}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-amber-700">近12个月订单</span>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-700">{stats.lastYearOrders}</div>
          <div className="text-xs text-amber-600 mt-1">笔订单</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-700">近12个月消费</span>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-700">{formatCurrency(stats.lastYearSpent)}</div>
          <div className="text-xs text-blue-600 mt-1">年度贡献</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            常印产品类型
          </h3>
          {productDistribution.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {productDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              暂无数据
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            月度消费趋势
          </h3>
          {monthlyData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              暂无数据
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              常用纸张
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {paperDistribution.length > 0 ? (
                paperDistribution.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-500" />
              常印规格
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {sizeDistribution.length > 0 ? (
                sizeDistribution.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg border border-violet-200"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </div>
          {customer.remark && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-2">客户备注</h3>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                {customer.remark}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            历史订单记录（共 {customerOrders.length} 笔）
          </h3>
          <Link
            to="/orders/new"
            className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
          >
            + 为此客户下单
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">订单号</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">产品明细</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">总数量</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">金额</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">下单时间</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerOrders.length > 0 ? (
                customerOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 text-sm">{order.orderNo}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="text-xs text-slate-600 flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                              {PRODUCT_TYPE_LABELS[item.productType]}
                            </span>
                            {item.finishedWidth}×{item.finishedHeight}mm · {PAPER_TYPE_LABELS[item.paperType]}{item.paperWeight}g
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-slate-400">+{order.items.length - 2}项产品</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {order.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}
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
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    该客户暂无订单记录
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
