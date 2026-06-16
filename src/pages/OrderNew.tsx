import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Printer } from 'lucide-react';
import CustomerSelector from '@/components/Order/CustomerSelector';
import ProductForm from '@/components/Order/ProductForm';
import { useAppStore } from '@/store';
import type { Customer, OrderItem, ProductionItem } from '@/types';
import { generateCuttingInstruction } from '@/utils/layout';
import { PAPER_TYPE_LABELS, LAMINATION_LABELS } from '@/types';
import { formatCurrency, generateOrderNo } from '@/utils/format';

export default function OrderNew() {
  const navigate = useNavigate();
  const { addOrder, addProductionOrder } = useAppStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderItem, setOrderItem] = useState<OrderItem | null>(null);
  const [remark, setRemark] = useState('');

  const totalAmount = orderItem?.subtotal || 0;

  const handleSaveOrder = (status: 'quoted' | 'confirmed') => {
    if (!customer || !orderItem) {
      alert('请先选择客户并填写产品信息');
      return;
    }

    const order = addOrder({
      orderNo: generateOrderNo(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: [orderItem],
      status,
      remark,
      totalAmount,
      confirmedAt: status === 'confirmed' ? new Date().toISOString() : undefined
    });

    if (status === 'confirmed') {
      const productionItems: ProductionItem[] = order.items.map((item) => ({
        orderItemId: item.id,
        productName: item.productName,
        paperSpec: `${PAPER_TYPE_LABELS[item.paperType]}${item.paperWeight}g`,
        finishedSize: `${item.finishedWidth}×${item.finishedHeight}mm`,
        parentSize: `${item.parentPaperName} (${item.parentWidth}×${item.parentHeight}mm)`,
        layout: `${item.layoutHorizontal}×${item.layoutVertical} = ${item.perSheetCount}张/张${item.rotated ? ' (旋转)' : ''}`,
        quantity: item.quantity,
        sheetsNeeded: item.sheetsNeeded,
        lamination: LAMINATION_LABELS[item.lamination],
        cuttingInstruction: generateCuttingInstruction(
          item.layoutHorizontal,
          item.layoutVertical,
          item.finishedWidth,
          item.finishedHeight,
          item.rotated
        )
      }));

      addProductionOrder({
        orderId: order.id,
        orderNo: order.orderNo,
        customerName: order.customerName,
        items: productionItems,
        status: 'pending'
      });

      alert(`订单已确认！\n订单号：${order.orderNo}\n生产单已同步生成`);
    } else {
      alert(`报价单已保存！\n订单号：${order.orderNo}`);
    }

    navigate(`/orders/${order.id}`);
  };

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
            <h1 className="text-2xl font-bold text-slate-800">新建订单</h1>
            <p className="text-sm text-slate-500 mt-1">录入客户信息、产品规格，自动计算拼版与报价</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveOrder('quoted')}
            disabled={!customer || !orderItem}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存报价单
          </button>
          <button
            onClick={() => handleSaveOrder('confirmed')}
            disabled={!customer || !orderItem}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-amber-200"
          >
            <Printer className="w-4 h-4" />
            确认下单生成生产单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <CustomerSelector selectedCustomer={customer} onSelect={setCustomer} />
          <ProductForm onChange={setOrderItem} />

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></span>
              订单备注
            </h3>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="填写特殊要求、交期说明、送货方式等..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none h-24"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-5 text-white sticky top-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              订单汇总
            </h3>

            {customer && orderItem ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-xs text-slate-400 mb-2">客户信息</div>
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-sm text-slate-300 mt-1">{customer.phone}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-xs text-slate-400 mb-2">产品</div>
                  <div className="font-semibold">{orderItem.productName}</div>
                  <div className="text-sm text-slate-300 mt-1">
                    {orderItem.finishedWidth}×{orderItem.finishedHeight}mm · {orderItem.quantity.toLocaleString()}张
                  </div>
                  <div className="text-sm text-slate-300">
                    {PAPER_TYPE_LABELS[orderItem.paperType]} {orderItem.paperWeight}g
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-xs text-slate-400 mb-2">拼版信息</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">用纸规格</span>
                    <span className="font-medium">{orderItem.parentPaperName}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-300">拼版方式</span>
                    <span className="font-medium">
                      {orderItem.layoutHorizontal}×{orderItem.layoutVertical} = {orderItem.perSheetCount}张
                      {orderItem.rotated && ' (旋转)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-300">用纸张数</span>
                    <span className="font-medium text-amber-400 font-bold">{orderItem.sheetsNeeded}张</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">纸张成本</span>
                    <span>¥{orderItem.paperCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">印刷成本</span>
                    <span>¥{orderItem.printingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">覆膜成本</span>
                    <span>¥{orderItem.laminationCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">总成本</span>
                    <span className="font-medium">¥{orderItem.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">利润率</span>
                    <span className="text-emerald-400 font-medium">{orderItem.profitRate}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">应收金额</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                请先选择客户并填写产品信息
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
