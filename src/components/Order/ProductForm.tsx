import { useEffect, useMemo } from 'react';
import { calculateLayout, calculateSheetsNeeded } from '@/utils/layout';
import {
  calculateLaminationCost,
  calculatePaperCost,
  calculatePricing,
  calculatePrintingCost
} from '@/utils/pricing';
import { DEFAULT_PRODUCT_SPECS, PRODUCT_TYPE_OPTIONS } from '@/data/products';
import { PAPER_TYPE_LABELS, LAMINATION_LABELS, PRODUCT_TYPE_LABELS, type OrderItem, type ProductType, type PaperType, type LaminationType } from '@/types';
import { PAPER_WEIGHT_OPTIONS } from '@/data/papers';
import { useAppStore } from '@/store';
import LayoutPreview from './LayoutPreview';
import { generateId } from '@/utils/format';

interface ProductFormProps {
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
  otherCost: 0
};

export default function ProductForm({ onChange }: ProductFormProps) {
  const { paperSpecs } = useAppStore();
  const [form, setForm] = useStateWrap(defaultForm);

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
      const item: OrderItem = {
        id: generateId(),
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
        subtotal: costs.total
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
      finishedHeight: specs?.height || 0
    });
  };

  const handlePresetSelect = (name: string) => {
    const spec = DEFAULT_PRODUCT_SPECS.find((p) => p.name === name);
    if (spec) {
      setForm({ ...form, productName: name, finishedWidth: spec.width, finishedHeight: spec.height });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></span>
          产品信息
        </h3>

        <div className="mb-4">
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
          <div className="mb-4">
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

        <div className="grid grid-cols-2 gap-4 mb-4">
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

        <div className="grid grid-cols-2 gap-4 mb-4">
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

      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <span className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"></span>
          成本与报价
        </h3>

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
                onChange={(e) => setForm({ ...form, profitRate: +e.target.value })}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">成品单价</span>
                <span className="font-bold text-slate-800">¥{costs.unitPrice.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">所需大纸</span>
                <span className="font-bold text-slate-800">{sheetsNeeded} 张</span>
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-200">
                <span className="font-bold text-slate-700">建议报价</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ¥{costs.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState as useStateWrap } from 'react';
