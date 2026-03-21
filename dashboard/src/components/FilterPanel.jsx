import { useI18n } from "../i18n/I18nContext";

export default function FilterPanel({
  filters,
  setFilters,
  sectors,
  defaultFilters,
  resultCount,
  open,
  onClose,
}) {
  const { t } = useI18n();
  const update = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 p-5 overflow-y-auto
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:z-auto md:min-h-[calc(100vh-73px)] md:shrink-0
        `}
      >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-800">{t("filter.title")}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilters(defaultFilters)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {t("filter.reset")}
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg px-3 py-2 mb-5 text-center">
        <span className="text-2xl font-bold text-blue-700">{resultCount}</span>
        <span className="text-sm text-blue-600 ml-1">{t("filter.resultUnit")}</span>
      </div>

      <div className="space-y-5">
        <RangeFilter
          label={t("filter.rsi.label")}
          hint={t("filter.rsi.hint")}
          minValue={filters.rsiMin}
          maxValue={filters.rsiMax}
          min={0}
          max={100}
          onMinChange={(v) => update("rsiMin", v)}
          onMaxChange={(v) => update("rsiMax", v)}
        />

        <SliderFilter
          label={t("filter.marketCap.label")}
          hint={t("filter.marketCap.hint")}
          value={filters.marketCap}
          min={50}
          max={500}
          step={10}
          onChange={(v) => update("marketCap", v)}
          format={(v) => `> ${v}B`}
        />

        <SliderFilter
          label={t("filter.52wHigh.label")}
          hint={t("filter.52wHigh.hint")}
          value={filters.pctFromHigh}
          min={50}
          max={95}
          onChange={(v) => update("pctFromHigh", v)}
          format={(v) => `> ${v}%`}
        />

        <SliderFilter
          label={t("filter.epsGrowth.label")}
          hint={t("filter.epsGrowth.hint")}
          value={filters.epsGrowth}
          min={-20}
          max={50}
          onChange={(v) => update("epsGrowth", v)}
          format={(v) => `> ${v}%`}
        />

        <SliderFilter
          label={t("filter.revGrowth.label")}
          hint={t("filter.revGrowth.hint")}
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
            <span className="text-sm text-gray-700">{t("filter.buyOnly.label")}</span>
          </label>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">{t("filter.buyOnly.hint")}</p>
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
              {t("filter.perBelowSector.label")}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">{t("filter.perBelowSector.hint")}</p>
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
              {t("filter.above200dma.label")}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">{t("filter.above200dma.hint")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("filter.sector.label")}
          </label>
          <select
            value={filters.sector}
            onChange={(e) => update("sector", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t("filter.sector.all")}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
    </>
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
  const { t } = useI18n();
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
          <span className="text-xs text-gray-500 w-8">{t("filter.rangeMin")}</span>
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
          <span className="text-xs text-gray-500 w-8">{t("filter.rangeMax")}</span>
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
