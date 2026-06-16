interface LayoutPreviewProps {
  finishedWidth: number;
  finishedHeight: number;
  parentWidth: number;
  parentHeight: number;
  horizontal: number;
  vertical: number;
  rotated: boolean;
  perSheet: number;
}

export default function LayoutPreview({
  finishedWidth,
  finishedHeight,
  parentWidth,
  parentHeight,
  horizontal,
  vertical,
  rotated,
  perSheet
}: LayoutPreviewProps) {
  const scale = Math.min(500 / parentWidth, 320 / parentHeight, 1);
  const displayW = parentWidth * scale;
  const displayH = parentHeight * scale;

  const actualFW = rotated ? finishedHeight : finishedWidth;
  const actualFH = rotated ? finishedWidth : finishedHeight;
  const itemW = actualFW * scale;
  const itemH = actualFH * scale;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-700">拼版预览</h4>
        <div className="flex items-center gap-2">
          {perSheet > 0 ? (
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
              {horizontal} × {vertical} = {perSheet} 张/大纸
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
              尺寸过大，无法拼版
            </span>
          )}
          {rotated && perSheet > 0 && (
            <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              旋转90°
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center bg-white rounded-lg p-4 border border-slate-200 min-h-[280px]">
        <div
          className="relative bg-white border-2 border-dashed border-slate-300 shadow-sm"
          style={{ width: displayW, height: displayH }}
        >
          <div className="absolute -top-7 left-0 text-xs text-slate-500 font-medium">
            {parentWidth}mm
          </div>
          <div
            className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium"
            style={{ writingMode: 'vertical-rl' }}
          >
            {parentHeight}mm
          </div>

          {horizontal > 0 && vertical > 0 && (
            <div className="absolute inset-1.5 grid gap-0.5" style={{
              gridTemplateColumns: `repeat(${horizontal}, 1fr)`,
              gridTemplateRows: `repeat(${vertical}, 1fr)`,
              width: `calc(100% - 12px)`,
              height: `calc(100% - 12px)`,
              margin: '6px'
            }}>
              {Array.from({ length: horizontal * vertical }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 rounded-sm flex items-center justify-center text-[9px] text-amber-700 font-semibold overflow-hidden"
                >
                  {actualFW}×{actualFH}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {perSheet > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-slate-500 mb-1">成品尺寸</div>
            <div className="font-bold text-slate-800">{finishedWidth} × {finishedHeight} mm</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-slate-500 mb-1">出血位</div>
            <div className="font-bold text-slate-800">3 mm（每边）</div>
          </div>
        </div>
      )}
    </div>
  );
}
