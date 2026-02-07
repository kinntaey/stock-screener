export default function FilterPanel({
  filters,
  setFilters,
  sectors,
  defaultFilters,
  resultCount,
}) {
  const update = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <aside className="w-72 bg-white border-r border-gray-200 p-5 min-h-[calc(100vh-73px)] shrink-0">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-800">Filters</h2>
        <button
          onClick={() => setFilters(defaultFilters)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg px-3 py-2 mb-5 text-center">
        <span className="text-2xl font-bold text-blue-700">{resultCount}</span>
        <span className="text-sm text-blue-600 ml-1">종목</span>
      </div>

      <div className="space-y-5">
        <RangeFilter
          label="RSI (14)"
          hint="낮을수록 과매도 → 반등 기대"
          minValue={filters.rsiMin}
          maxValue={filters.rsiMax}
          min={0}
          max={100}
          onMinChange={(v) => update("rsiMin", v)}
          onMaxChange={(v) => update("rsiMax", v)}
        />

        <SliderFilter
          label="Market Cap"
          hint="높을수록 대형 안정주"
          value={filters.marketCap}
          min={50}
          max={500}
          step={10}
          onChange={(v) => update("marketCap", v)}
          format={(v) => `> ${v}B`}
        />

        <SliderFilter
          label="52W High %"
          hint="높을수록 고점 근처 → 강세 신호"
          value={filters.pctFromHigh}
          min={50}
          max={95}
          onChange={(v) => update("pctFromHigh", v)}
          format={(v) => `> ${v}%`}
        />

        <SliderFilter
          label="EPS Growth"
          hint="높을수록 이익 성장 양호"
          value={filters.epsGrowth}
          min={-20}
          max={50}
          onChange={(v) => update("epsGrowth", v)}
          format={(v) => `> ${v}%`}
        />

        <SliderFilter
          label="Revenue Growth (YoY)"
          hint="높을수록 매출 성장 양호"
          value={filters.revenueGrowth}
          min={-20}
          max={50}
          onChange={(v) => update("revenueGrowth", v)}
          format={(v) => `> ${v}%`}
        />

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.buyOnly}
              onChange={(e) => update("buyOnly", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Buy / Strong Buy Only</span>
          </label>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">점수 낮을수록 강력 매수 추천</p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.perBelowSector}
              onChange={(e) => update("perBelowSector", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              PER &lt; Sector Average
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">PER 낮을수록 저평가 가능성</p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.above200dma}
              onChange={(e) => update("above200dma", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Price &gt; 80% of 200DMA
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">장기 이동평균 위 = 추세 지지 중</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <select
            value={filters.sector}
            onChange={(e) => update("sector", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}

function SliderFilter({ label, hint, value, min, max, step = 1, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {format(value)}
        </span>
      </div>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function RangeFilter({ label, hint, minValue, maxValue, min, max, step = 1, onMinChange, onMaxChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {minValue} ~ {maxValue}
        </span>
      </div>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">Min</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v <= maxValue) onMinChange(v);
            }}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">Max</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= minValue) onMaxChange(v);
            }}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
