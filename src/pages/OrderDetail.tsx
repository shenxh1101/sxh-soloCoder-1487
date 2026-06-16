import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Package, XCircle, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PRODUCT_TYPE_LABELS,
  PAPER_TYPE_LABELS,
  LAMINATION_LABELS,
  type OrderStatus
} from '@/types';
import { formatCurrency, formatDateTime, formatSize } from '@/utils/format';
import LayoutPreview from '@/components/Order/LayoutPreview';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, productionOrders } = useAppStore();

  const order = orders.find((o) => o.id === id);
  const productionOrder = productionOrders.find((p) => p.orderId === id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 mb-4">订单不存在</p>
        <button onClick={() => navigate('/orders')} className="text-amber-600 hover:text-amber-700 font-medium">
          返回订单列表
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: OrderStatus) => {
    if (confirm(`确定要将订单状态改为"${ORDER_STATUS_LABELS[status]}"吗？`)) {
      updateOrderStatus(order.id, status);
    }
  };

  const statusActions: { status: OrderStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
    order.status === 'quoted' ? { status: 'confirmed', label: '确认订单', icon: CheckCircle, color: 'bg-emerald-500 hover:bg-emerald-600' } : null,
    order.status === 'confirmed' ? { status: 'in_production', label: '开始生产', icon: Package, color: 'bg-blue-500 hover:bg-blue-600' } : null,
    order.status === 'in_production' ? { status: 'completed', label: '完成生产', icon: CheckCircle, color: 'bg-purple-500 hover:bg-purple-600' } : null,
    (order.status === 'draft' || order.status === 'quoted') ? { status: 'cancelled', label: '取消订单', icon: XCircle, color: 'bg-red-500 hover:bg-red-600' } : null
  ].filter(Boolean) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">订单详情</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">订单号：{order.orderNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {statusActions.map((action) => (
            <button
              key={action.status}
              onClick={() => handleStatusChange(action.status)}
              className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors ${action.color}`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
          {productionOrder && (
            <Link
              to={`/production/${productionOrder.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              查看生产单
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></span>
              客户信息
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-slate-400 mb-1">客户名称</div>
                <div className="font-semibold text-slate-800">{order.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">联系电话</div>
                <div className="font-semibold text-slate-800">{order.customerPhone}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">创建时间</div>
                <div className="font-semibold text-slate-800">{formatDateTime(order.createdAt)}</div>
              </div>
              {order.confirmedAt && (
                <div>
                  <div className="text-xs text-slate-400 mb-1">确认时间</div>
                  <div className="font-semibold text-slate-800">{formatDateTime(order.confirmedAt)}</div>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <div className="text-xs text-slate-400 mb-1">完成时间</div>
                  <div className="font-semibold text-slate-800">{formatDateTime(order.completedAt)}</div>
                </div>
              )}
            </div>
            {order.remark && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-xs text-amber-600 mb-1 font-semibold">备注</div>
                <div className="text-sm text-amber-800">{order.remark}</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
              产品明细
            </h3>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={item.id} className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
                  {order.items.length > 1 && (
                    <div className="text-xs text-slate-400 font-bold mb-3">第 {idx + 1} 项</div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-400 mb-1">产品名称</div>
                      <div className="font-bold text-slate-800 text-lg">{item.productName}</div>
                      <div className="text-sm text-slate-500 mt-1">{PRODUCT_TYPE_LABELS[item.productType]}</div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-400 mb-1">数量 / 规格</div>
                      <div className="font-bold text-slate-800 text-lg">{item.quantity.toLocaleString()} 张</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {formatSize(item.finishedWidth, item.finishedHeight)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-400 mb-1">纸张</div>
                      <div className="font-bold text-slate-800">
                        {PAPER_TYPE_LABELS[item.paperType]} {item.paperWeight}g
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{LAMINATION_LABELS[item.lamination]}</div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-400 mb-1">用纸情况</div>
                      <div className="font-bold text-slate-800">
                        {item.parentPaperName} · {item.sheetsNeeded} 张
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {item.layoutHorizontal}×{item.layoutVertical} = {item.perSheetCount}张/大纸
                        {item.rotated && ' (旋转)'}
                      </div>
                    </div>
                  </div>

                  <LayoutPreview
                    finishedWidth={item.finishedWidth}
                    finishedHeight={item.finishedHeight}
                    parentWidth={item.parentWidth}
                    parentHeight={item.parentHeight}
                    horizontal={item.layoutHorizontal}
                    vertical={item.layoutVertical}
                    rotated={item.rotated}
                    perSheet={item.perSheetCount}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-5">
            <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
              报价对比汇总
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                <div className="text-xs text-slate-500 mb-1">成本合计</div>
                <div className="text-lg font-bold text-slate-700">{formatCurrency(order.totalCost)}</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                <div className="text-xs text-slate-500 mb-1">系统建议价</div>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(order.quoteAmount)}</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                <div className="text-xs text-slate-500 mb-1">最终报价</div>
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(order.totalAmount)}</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                <div className="text-xs text-slate-500 mb-1">调整差额</div>
                <div className={`text-lg font-bold ${order.totalAmount - order.quoteAmount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {order.totalAmount - order.quoteAmount >= 0 ? '+' : ''}{formatCurrency(order.totalAmount - order.quoteAmount)}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">实际利润率</span>
                <span className={`text-lg font-bold ${order.totalCost > 0 ? (order.totalAmount - order.totalCost >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-slate-400'}`}>
                  {order.totalCost > 0 ? `${((order.totalAmount - order.totalCost) / order.totalCost * 100).toFixed(1)}%` : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-base font-bold mb-4">费用明细（按项目）</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const actualProfit = item.totalCost > 0 ? ((item.finalSubtotal - item.totalCost) / item.totalCost * 100).toFixed(1) : '-';
                return (
                  <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">第 {idx + 1} 项</span>
                        {item.useManualPrice && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                            手动改价
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {item.useManualPrice ? (
                          <div>
                            <div className="text-[10px] text-slate-500 line-through">建议 {formatCurrency(item.subtotal)}</div>
                            <div className="text-emerald-400 font-bold">{formatCurrency(item.finalSubtotal)}</div>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-bold">{formatCurrency(item.subtotal)}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>纸张成本</span>
                        <span>¥{item.paperCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>印刷成本</span>
                        <span>¥{item.printingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>覆膜成本</span>
                        <span>¥{item.laminationCost.toFixed(2)}</span>
                      </div>
                      {item.otherCost > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>其他成本</span>
                          <span>¥{item.otherCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white pt-2 mt-2 border-t border-white/10">
                        <span>总成本</span>
                        <span className="font-medium">¥{item.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1.5">
                        <div className="flex justify-between text-blue-400">
                          <span>建议利润率</span>
                          <span className="font-medium">{item.profitRate}%</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>实际利润率</span>
                          <span className="font-medium">{actualProfit}%</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>建议单价</span>
                          <span>¥{item.unitPrice.toFixed(4)}</span>
                        </div>
                        <div className={`flex justify-between ${item.useManualPrice ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                          <span>{item.useManualPrice ? '实际单价' : '单价'}</span>
                          <span>¥{(item.useManualPrice ? item.finalUnitPrice : item.unitPrice).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-5 mt-5 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">订单总计</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4">订单状态流转</h3>
            <div className="space-y-3">
              {[
                { key: 'draft', label: '草稿' },
                { key: 'quoted', label: '已报价' },
                { key: 'confirmed', label: '已确认' },
                { key: 'in_production', label: '生产中' },
                { key: 'completed', label: '已完成' }
              ].map((step, idx, arr) => {
                const statusIdx = arr.findIndex((s) => s.key === order.status);
                const currentIdx = arr.findIndex((s) => s.key === step.key);
                const isDone = currentIdx < statusIdx || step.key === order.status;
                const isCurrent = step.key === order.status;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isCurrent
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                          : isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${isCurrent ? 'text-amber-600' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
