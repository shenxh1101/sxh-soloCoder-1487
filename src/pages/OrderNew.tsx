import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Printer, Plus, TrendingUp, Layers } from 'lucide-react';
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
  const [remark, setRemark] = useState('');
  const [items, setItems] = useState<(OrderItem | null)[]>([null]);

  const validItems = items.filter((i): i is OrderItem => i !== null);
  const totalCost = validItems.reduce((s, i) => s + i.totalCost, 0);
  const quoteAmount = validItems.reduce((s, i) => s + i.subtotal, 0);
  const totalAmount = validItems.reduce((s, i) => s + i.finalSubtotal, 0);
  const actualProfit = totalCost > 0 ? ((totalAmount - totalCost) / totalCost) * 100 : 0;

  const addItem = () => {
    setItems([...items, null]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, item: OrderItem | null) => {
    setItems(items.map((it, i) => (i === index ? item : it)));
  };

  const handleSaveOrder = (status: 'quoted' | 'confirmed') => {
    if (!customer) {
      alert('请先选择客户！');
      return;
    }
    if (validItems.length === 0) {
      alert('请至少填写一项产品信息！');
      return;
    }

    const order = addOrder({
      orderNo: generateOrderNo(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: validItems,
      status,
      remark,
      totalAmount,
      quoteAmount,
      totalCost,
      confirmedAt: status === 'confirmed' ? new Date().toISOString() : undefined
    });

    if (status === 'confirmed') {
      const productionItems: ProductionItem[] = validItems.map((item) => ({
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

      alert(`✅ 订单已确认！\n订单号：${order.orderNo}\n生产单已同步生成`);
    } else {
      alert(`📋 报价单已保存！\n订单号：${order.orderNo}`);
    }

    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">新建订单</h1>
            <p className="text-sm text-slate-500 mt-1">支持多产品项录入，系统自动汇总报价</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveOrder('quoted')}
            disabled={!customer || validItems.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存报价单
          </button>
          <button
            onClick={() => handleSaveOrder('confirmed')}
            disabled={!customer || validItems.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-amber-200"
          >
            <Printer className="w-4 h-4" />
            确认下单生成生产单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <CustomerSelector selectedCustomer={customer} onSelect={setCustomer} />

          {items.map((item, index) => (
            <ProductForm
              key={index}
              itemIndex={index}
              itemValue={item}
              canRemove={items.length > 1}
              onRemove={() => removeItem(index)}
              onChange={(it) => updateItem(index, it)}
            />
          ))}

          <button
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/40 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <Plus className="w-5 h-5" />
            增加产品项（同订单可加印名片、宣传单等多种）
          </button>

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

        <div className="space-y-5">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-5 text-white sticky top-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                订单汇总
              </h3>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/10">
                {validItems.length} 项产品
              </span>
            </div>

            {customer && validItems.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-xs text-slate-400 mb-2">客户信息</div>
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-sm text-slate-300 mt-1">{customer.phone}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 space-y-2">
                  <div className="text-xs text-slate-400 mb-2">产品明细</div>
                  {validItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py-1.5 text-xs border-b border-white/5 last:border-0">
                      <div>
                        <div className="font-semibold text-slate-100">
                          {idx + 1}. {item.productName}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {item.quantity.toLocaleString()}张 · {item.parentPaperName} {item.sheetsNeeded}张
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${item.useManualPrice ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ¥{item.finalSubtotal.toFixed(2)}
                        </div>
                        {item.useManualPrice && (
                          <div className="text-slate-500 text-[10px] mt-0.5">(手动定价)</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">成本合计</span>
                    <span>¥{totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">系统建议价</span>
                    <span className="text-slate-200">¥{quoteAmount.toFixed(2)}</span>
                  </div>
                  {totalAmount !== quoteAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        手动调整差额
                      </span>
                      <span className={totalAmount > quoteAmount ? 'text-emerald-400' : 'text-red-400'}>
                        {totalAmount > quoteAmount ? '+' : ''}¥{(totalAmount - quoteAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold">应收金额</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        综合利润率
                        <span className={`font-bold ml-1 ${actualProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {actualProfit.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-600 opacity-40" />
                <p>请先选择客户</p>
                <p className="text-slate-600">并填写至少一项产品信息</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
