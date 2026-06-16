import { useEffect, useMemo, useState } from 'react';
import { calculateLayout, calculateSheetsNeeded } from '@/utils/layout';
import {
  calculateLaminationCost,
  calculatePaperCost,
  calculatePricing,
  calculatePrintingCost
} from '@/utils/pricing';
import { DEFAULT_PRODUCT_SPECS, PRODUCT_TYPE_OPTIONS } from '@/data/products';
import { PAPER_TYPE_LABELS, LAMINATION_LABELS, type OrderItem, type ProductType, type PaperType, type LaminationType } from '@/types';
import { PAPER_WEIGHT_OPTIONS } from '@/data/papers';
import { useAppStore } from '@/store';
import LayoutPreview from './LayoutPreview';
import { generateId } from '@/utils/format';
import { Pencil, RefreshCw, Edit3, Check, X } from 'lucide-react';

interface ProductFormProps {
  itemIndex: number;
  itemValue: OrderItem | null;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (item: OrderItem | null) => void;
}

const defaultForm = {
  productType: 'business_card' as ProductType,
  productName: '标准名片',
  paperType: 'coated' as PaperType,
  paperWeight: 300,
  finishedWidth: 90,
  finishedHeight: 54,
  quantity: 500,
  lamination: 'gloss' as LaminationType,
  parentPaperId: 'paper-a3',
  profitRate: 50,
  otherCost: 0,
  useManualPrice: false,
  manualSubtotal: 0
};

export default function ProductForm({ itemIndex, onChange, canRemove, onRemove, itemValue }: ProductFormProps) {
  const { paperSpecs } = useAppStore();
  const [form, setForm] = useState(defaultForm);

  const selectedProductSpecs = DEFAULT_PRODUCT_SPECS.filter((p) => p.type === form.productType);
  const selectedPaper = paperSpecs.find((p) => p.id === form.parentPaperId) || paperSpecs[0];

  const layout = useMemo(
    () =>
      calculateLayout(
        form.finishedWidth,
        form.finishedHeight,
        selectedPaper?.width || 420,
        selectedPaper?.height || 297
      ),
    [form.finishedWidth, form.finishedHeight, selectedPaper]
  );

  const sheetsNeeded = calculateSheetsNeeded(form.quantity, layout.perSheet);

  const costs = useMemo(() => {
    const paperCost = calculatePaperCost(sheetsNeeded, selectedPaper?.unitPrice || 0, form.paperWeight);
    const printingCost = calculatePrintingCost(sheetsNeeded);
    const laminationCost = calculateLaminationCost(
      sheetsNeeded,
      selectedPaper?.width || 0,
      selectedPaper?.height || 0,
      form.lamination
    );
    const totalCost = +(paperCost + printingCost + laminationCost + (form.otherCost || 0)).toFixed(2);
    const pricing = calculatePricing(totalCost, form.quantity, form.profitRate);
    return { paperCost, printingCost, laminationCost, totalCost, ...pricing };
  }, [sheetsNeeded, selectedPaper, form.paperWeight, form.lamination, form.otherCost, form.quantity, form.profitRate]);

  useEffect(() => {
    if (layout.perSheet > 0 && form.quantity > 0) {
      const useManual = form.useManualPrice;
      const finalSubtotal = useManual ? +(form.manualSubtotal || 0).toFixed(2) : costs.total;
      const finalUnitPrice = useManual
        ? form.quantity > 0
          ? +((form.manualSubtotal || 0) / form.quantity).toFixed(4)
          : 0
        : costs.unitPrice;

      const item: OrderItem = {
        id: itemValue?.id || generateId(),
        productType: form.productType,
        productName: form.productName,
        paperType: form.paperType,
        paperWeight: form.paperWeight,
        finishedWidth: form.finishedWidth,
        finishedHeight: form.finishedHeight,
        quantity: form.quantity,
        lamination: form.lamination,
        parentPaperId: selectedPaper?.id || '',
        parentPaperName: selectedPaper?.name || '',
        parentWidth: selectedPaper?.width || 0,
        parentHeight: selectedPaper?.height || 0,
        layoutHorizontal: layout.horizontal,
        layoutVertical: layout.vertical,
        perSheetCount: layout.perSheet,
        sheetsNeeded,
        rotated: layout.rotated,
        paperCost: costs.paperCost,
        printingCost: costs.printingCost,
        laminationCost: costs.laminationCost,
        otherCost: form.otherCost || 0,
        totalCost: costs.totalCost,
        profitRate: form.profitRate,
        unitPrice: costs.unitPrice,
        subtotal: costs.total,
        useManualPrice: useManual,
        finalUnitPrice,
        finalSubtotal
      };
      onChange(item);
    } else {
      onChange(null);
    }
  }, [form, layout, sheetsNeeded, costs, selectedPaper]);

  const handleProductTypeChange = (type: ProductType) => {
    const specs = DEFAULT_PRODUCT_SPECS.filter((p) => p.type === type)[0];
    setForm({
      ...form,
      productType: type,
      productName: specs?.name || '',
      finishedWidth: specs?.width || 0,
      finishedHeight: specs?.height || 0,
      useManualPrice: false,
      manualSubtotal: 0
    });
  };

  const handlePresetSelect = (name: string) => {
    const spec = DEFAULT_PRODUCT_SPECS.find((p) => p.name === name);
    if (spec) {
      setForm({ ...form, productName: name, finishedWidth: spec.width, finishedHeight: spec.height });
    }
  };

  const toggleManualPrice = () => {
    if (!form.useManualPrice) {
      setForm({ ...form, useManualPrice: true, manualSubtotal: costs.total });
    } else {
      setForm({ ...form, useManualPrice: false, manualSubtotal: 0 });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {itemIndex + 1}
          </div>
          <h3 className="text-base font-bold text-slate-800">产品项 {itemIndex + 1}：{form.productName}</h3>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            删除此项
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">产品类型</label>
          <div className="grid grid-cols-3 gap-3">
            {PRODUCT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleProductTypeChange(opt.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  form.productType === opt.value
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`font-bold text-sm ${form.productType === opt.value ? 'text-amber-700' : 'text-slate-700'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedProductSpecs.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">常用规格</label>
            <div className="flex flex-wrap gap-2">
              {selectedProductSpecs.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => handlePresetSelect(spec.name)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    form.productName === spec.name
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {spec.name} ({spec.width}×{spec.height}mm)
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">成品宽度 (mm)</label>
            <input
              type="number"
              value={form.finishedWidth}
              onChange={(e) => setForm({ ...form, finishedWidth: +e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">成品高度 (mm)</label>
            <input
              type="number"
              value={form.finishedHeight}
              onChange={(e) => setForm({ ...form, finishedHeight: +e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">数量</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
              min={1}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">纸张规格（大纸）</label>
            <select
              value={form.parentPaperId}
              onChange={(e) => setForm({ ...form, parentPaperId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            >
              {paperSpecs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.width}×{p.height}mm)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">纸张类型</label>
            <select
              value={form.paperType}
              onChange={(e) => setForm({ ...form, paperType: e.target.value as PaperType })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            >
              {Object.entries(PAPER_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">克重</label>
            <select
              value={form.paperWeight}
              onChange={(e) => setForm({ ...form, paperWeight: +e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            >
              {PAPER_WEIGHT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">覆膜</label>
            <select
              value={form.lamination}
              onChange={(e) => setForm({ ...form, lamination: e.target.value as LaminationType })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            >
              {Object.entries(LAMINATION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <LayoutPreview
          finishedWidth={form.finishedWidth}
          finishedHeight={form.finishedHeight}
          parentWidth={selectedPaper?.width || 0}
          parentHeight={selectedPaper?.height || 0}
          horizontal={layout.horizontal}
          vertical={layout.vertical}
          rotated={layout.rotated}
          perSheet={layout.perSheet}
        />

        <div className="border-t-2 border-dashed border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"></span>
              成本与报价
            </h3>
            <button
              onClick={toggleManualPrice}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                form.useManualPrice
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {form.useManualPrice ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {form.useManualPrice ? '已手动定价' : '手动改价'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">纸张成本</span>
                <span className="font-semibold text-slate-800">¥{costs.paperCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">印刷成本</span>
                <span className="font-semibold text-slate-800">¥{costs.printingCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">覆膜成本</span>
                <span className="font-semibold text-slate-800">¥{costs.laminationCost.toFixed(2)}</span>
              </div>
              <div>
                <label className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-600">其他成本</span>
                </label>
                <input
                  type="number"
                  value={form.otherCost}
                  onChange={(e) => setForm({ ...form, otherCost: +e.target.value })}
                  min={0}
                  step={0.01}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">总成本</span>
                <span className="text-xl font-bold text-slate-900">¥{costs.totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>期望利润率</span>
                  <span className="text-amber-600 font-bold text-lg">{form.profitRate}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={150}
                  value={form.profitRate}
                  onChange={(e) => setForm({ ...form, profitRate: +e.target.value, useManualPrice: false, manualSubtotal: 0 })}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                  <span>150%</span>
                </div>
              </div>

              {form.useManualPrice && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-300 shadow-sm">
                  <label className="text-xs font-bold text-emerald-700 block mb-1.5 flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    手动输入最终报价
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
                    <input
                      type="number"
                      value={form.manualSubtotal}
                      onChange={(e) => setForm({ ...form, manualSubtotal: +e.target.value })}
                      min={0}
                      step={0.01}
                      className="w-full pl-7 pr-3 py-2.5 border-2 border-emerald-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setForm({ ...form, useManualPrice: false, manualSubtotal: 0 })}
                    className="mt-2 text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    恢复系统建议价
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">成品单价</span>
                  <span className="font-bold text-slate-800">
                    ¥{(form.useManualPrice
                      ? (form.quantity > 0 ? (form.manualSubtotal || 0) / form.quantity : 0)
                      : costs.unitPrice
                    ).toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">所需大纸</span>
                  <span className="font-bold text-slate-800">{sheetsNeeded} 张</span>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-200">
                  <span className="font-bold text-slate-700 text-sm">
                    {form.useManualPrice ? '最终报价' : '系统建议报价'}
                  </span>
                  <span
                    className={`text-2xl font-bold bg-gradient-to-r ${
                      form.useManualPrice
                        ? 'from-emerald-600 to-teal-600'
                        : 'from-amber-600 to-orange-600'
                    } bg-clip-text text-transparent`}
                  >
                    ¥{(form.useManualPrice ? form.manualSubtotal : costs.total).toFixed(2)}
                  </span>
                </div>
                {form.useManualPrice && (
                  <div className="text-xs text-slate-500 pt-2">
                    实际利润率：
                    <span className="font-bold text-emerald-600 ml-1">
                      {costs.totalCost > 0
                        ? ((((form.manualSubtotal || 0) - costs.totalCost) / costs.totalCost) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
