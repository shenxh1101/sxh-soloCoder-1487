import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Package, Clock, FileText, Scissors, Download } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, formatDateTime } from '@/utils/format';
import LayoutPreview from '@/components/Order/LayoutPreview';
import { useMemo } from 'react';

export default function ProductionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { productionOrders, orders, updateProductionOrder } = useAppStore();

  const productionOrder = productionOrders.find((p) => p.id === id);
  const order = orders.find((o) => o.id === productionOrder?.orderId);

  if (!productionOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 mb-4">生产单不存在</p>
        <button onClick={() => navigate('/production')} className="text-amber-600 hover:text-amber-700 font-medium">
          返回生产单列表
        </button>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待生产', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, dot: 'bg-amber-500' };
      case 'producing':
        return { label: '生产中', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package, dot: 'bg-blue-500' };
      case 'done':
        return { label: '已完成', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, dot: 'bg-emerald-500' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, dot: 'bg-gray-500' };
    }
  };

  const statusInfo = getStatusInfo(productionOrder.status);
  const StatusIcon = statusInfo.icon;

  const orderItems = useMemo(() => {
    if (!order) return [];
    return order.items;
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">生产单详情</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              订单号：{productionOrder.orderNo} · 创建时间：{formatDateTime(productionOrder.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {order && (
            <Link
              to={`/orders/${order.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              查看订单
            </Link>
          )}
          {productionOrder.status === 'pending' && (
            <button
              onClick={() => updateProductionOrder(productionOrder.id, { status: 'producing' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Package className="w-4 h-4" />
              开始生产
            </button>
          )}
          {productionOrder.status === 'producing' && (
            <button
              onClick={() => {
                updateProductionOrder(productionOrder.id, { status: 'done' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              完成生产
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold rounded-xl hover:from-slate-900 hover:to-black shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            打印生产单
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-slate-300">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white print:bg-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">印刷生产工单</h2>
                  <p className="text-slate-400 text-sm mt-1">PRODUCTION WORK ORDER</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold tracking-wider text-amber-400">
                {productionOrder.orderNo}
              </div>
              <div className="text-sm text-slate-400 mt-1">工单编号</div>
            </div>
          </div>
        </div>

        <div className="p-6 print:p-4 space-y-6">
          <div className="grid grid-cols-4 gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">客户名称</div>
              <div className="font-bold text-slate-800 text-lg">{productionOrder.customerName}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">开单日期</div>
              <div className="font-semibold text-slate-800">{formatDate(productionOrder.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">产品总数</div>
              <div className="font-semibold text-slate-800">
                {productionOrder.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()} 张
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">工单状态</div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold border ${statusInfo.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot} ${productionOrder.status === 'producing' ? 'animate-pulse' : ''}`}></span>
                {statusInfo.label}
              </div>
            </div>
          </div>

          {productionOrder.items.map((item, idx) => {
            const orderItem = orderItems[idx];
            return (
              <div key={item.orderItemId} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{item.productName}</h3>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">成品规格</div>
                    <div className="font-bold text-slate-800 text-lg">{item.finishedSize}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">纸张要求</div>
                    <div className="font-bold text-slate-800 text-lg">{item.paperSpec}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">覆膜工艺</div>
                    <div className="font-bold text-slate-800 text-lg">{item.lamination}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-xs text-blue-600 mb-1">成品数量</div>
                    <div className="font-bold text-blue-700 text-lg">{item.quantity.toLocaleString()} 张</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="text-xs text-amber-600 mb-1">用纸张数</div>
                    <div className="font-bold text-amber-700 text-lg">{item.sheetsNeeded} 张大纸</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Scissors className="w-5 h-5 text-slate-600" />
                      <h4 className="font-bold text-slate-800">拼版与裁切说明</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm py-2 border-b border-slate-200/60">
                        <span className="text-slate-500">大纸规格</span>
                        <span className="font-semibold text-slate-800">{item.parentSize}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-200/60">
                        <span className="text-slate-500">拼版方式</span>
                        <span className="font-semibold text-slate-800">{item.layout}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-200/60">
                        <span className="text-slate-500">出血位</span>
                        <span className="font-semibold text-slate-800">3mm（每边）</span>
                      </div>
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="text-xs text-amber-700 font-bold mb-1 flex items-center gap-1">
                          <Scissors className="w-3.5 h-3.5" />
                          裁切操作指引
                        </div>
                        <div className="text-sm text-amber-800 leading-relaxed">
                          {item.cuttingInstruction}
                        </div>
                      </div>
                    </div>
                  </div>

                  {orderItem && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-slate-600" />
                        <h4 className="font-bold text-slate-800">拼版示意图</h4>
                      </div>
                      <LayoutPreview
                        finishedWidth={orderItem.finishedWidth}
                        finishedHeight={orderItem.finishedHeight}
                        parentWidth={orderItem.parentWidth}
                        parentHeight={orderItem.parentHeight}
                        horizontal={orderItem.layoutHorizontal}
                        vertical={orderItem.layoutVertical}
                        rotated={orderItem.rotated}
                        perSheet={orderItem.perSheetCount}
                      />
                    </div>
                  )}
                </div>

                {item.remark && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-sm font-bold text-red-700 mb-1">⚠️ 特殊注意事项</div>
                    <div className="text-sm text-red-800">{item.remark}</div>
                  </div>
                )}
              </div>
            );
          })}

          {order?.remark && (
            <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-sm font-bold text-slate-700 mb-1">📋 订单备注</div>
                <div className="text-sm text-slate-600">{order.remark}</div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-8">
            <div>
              <div className="text-xs text-slate-400 mb-2">开单人签字</div>
              <div className="border-b border-slate-300 h-10"></div>
              <div className="text-xs text-slate-400 mt-1">日期：____________</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">车间负责人签字</div>
              <div className="border-b border-slate-300 h-10"></div>
              <div className="text-xs text-slate-400 mt-1">日期：____________</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">质检签字</div>
              <div className="border-b border-slate-300 h-10"></div>
              <div className="text-xs text-slate-400 mt-1">日期：____________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
