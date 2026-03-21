import React, { useState, useMemo } from "react";
import { useI18n } from "../i18n/I18nContext";

const REC_COLORS = {
  strong_buy: "bg-green-100 text-green-700",
  buy: "bg-emerald-100 text-emerald-700",
  hold: "bg-yellow-100 text-yellow-700",
  sell: "bg-red-100 text-red-700",
  strong_sell: "bg-red-200 text-red-800",
};

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function formatMarketCap(v) {
  if (v == null) return "-";
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  return `${(v / 1e6).toFixed(0)}M`;
}

function RsiBadge({ rsi }) {
  const { t } = useI18n();
  if (rsi == null) return <span className="text-gray-400">-</span>;
  let color, label;
  if (rsi < 30) {
    color = "bg-red-100 text-red-700";
    label = t("rsi.oversold");
  } else if (rsi < 40) {
    color = "bg-orange-100 text-orange-700";
    label = t("rsi.weak");
  } else {
    color = "bg-gray-100 text-gray-600";
    label = t("rsi.neutral");
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {rsi.toFixed(1)} <span className="opacity-70">{label}</span>
    </span>
  );
}

const REC_KEYS = {
  strong_buy: "rec.strongBuy",
  buy: "rec.buy",
  hold: "rec.hold",
  sell: "rec.sell",
  strong_sell: "rec.strongSell",
};

function RecBadge({ rec, mean }) {
  const { t } = useI18n();
  if (!rec) return <span className="text-gray-400">-</span>;
  const tKey = REC_KEYS[rec];
  const color = REC_COLORS[rec] || "bg-gray-100 text-gray-600";
  const text = tKey ? t(tKey) : rec;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {text}
      {mean != null && (
        <span className="ml-1 opacity-60">({mean.toFixed(1)})</span>
      )}
    </span>
  );
}

function AiSummary({ summary }) {
  const { t, lang } = useI18n();
  if (!summary) return null;
  const text = typeof summary === "string" ? summary : (summary[lang] || summary.en);
  if (!text) return null;
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <span className="text-gray-500 text-xs">{t("table.detail.aiSummary")}</span>
      <p className="mt-1 text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

function ExpandedRow({ stock, sectorAvg, colCount }) {
  const { t } = useI18n();
  return (
    <tr className="bg-blue-50">
      <td colSpan={colCount} className="px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Detail label={t("table.detail.symbol")} value={stock.symbol} />
          <Detail label={t("table.detail.sector")} value={stock.sector} />
          <Detail label={t("table.detail.subIndustry")} value={stock.sub_industry} />
          <Detail label={t("table.detail.price")} value={stock.current_price != null ? `$${stock.current_price.toFixed(2)}` : "-"} />
          <Detail label={t("table.detail.52wHigh")} value={stock.fifty_two_week_high != null ? `$${stock.fifty_two_week_high.toFixed(2)}` : "-"} />
          <Detail label={t("table.detail.trailingPer")} value={stock.trailing_pe != null ? stock.trailing_pe.toFixed(2) : "-"} />
          <Detail label={t("table.detail.sectorAvgPer")} value={sectorAvg != null ? sectorAvg.toFixed(2) : "-"} />
          <Detail label={t("table.detail.200dSma")} value={stock.sma_200 != null ? `$${stock.sma_200.toFixed(2)}` : "-"} />
          <Detail label={t("table.detail.pctOf200dma")} value={stock.pct_from_200dma != null ? `${stock.pct_from_200dma.toFixed(1)}%` : "-"} />
          <Detail label={t("table.detail.divYield")} value={stock.dividend_yield != null ? `${stock.dividend_yield.toFixed(2)}%` : "-"} />
          <Detail label={t("table.detail.beta")} value={stock.beta != null ? stock.beta.toFixed(2) : "-"} />
        </div>
        <AiSummary summary={stock.ai_summary} />
      </td>
    </tr>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-gray-500">{label}</span>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}

export default function StockTable({
  stocks,
  sortKey,
  sortAsc,
  onSort,
  sectorAverages,
}) {
  const { t } = useI18n();
  const [expandedSymbol, setExpandedSymbol] = useState(null);

  const columns = useMemo(() => [
    { key: "name", label: t("table.col.name"), align: "left" },
    { key: "rsi", label: t("table.col.rsi"), align: "right" },
    { key: "market_cap", label: t("table.col.marketCap"), align: "right" },
    { key: "pct_from_high", label: t("table.col.52wHigh"), align: "right" },
    { key: "forward_pe", label: t("table.col.fwdPer"), align: "right" },
    { key: "earnings_growth", label: t("table.col.epsGrowth"), align: "right" },
    { key: "revenue_growth", label: t("table.col.revGrowth"), align: "right" },
    { key: "recommendation", label: t("table.col.rating"), align: "center" },
  ], [t]);

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">
          {t("table.noResults")}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {stocks.map((s) => (
          <div
            key={s.symbol}
            onClick={() =>
              setExpandedSymbol(expandedSymbol === s.symbol ? null : s.symbol)
            }
            className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{s.name}</div>
                <div className="text-xs text-gray-400">{s.symbol}</div>
              </div>
              <RsiBadge rsi={s.rsi} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">{t("table.mobile.cap")}</span>
                <p className="font-mono text-gray-800">{formatMarketCap(s.market_cap)}</p>
              </div>
              <div>
                <span className="text-gray-500">{t("table.mobile.52w")}</span>
                <p className="font-mono text-gray-800">{s.pct_from_high != null ? `${s.pct_from_high.toFixed(1)}%` : "-"}</p>
              </div>
              <div>
                <span className="text-gray-500">{t("table.mobile.fwdPe")}</span>
                <p className="font-mono text-gray-800">{s.forward_pe != null ? s.forward_pe.toFixed(1) : "-"}</p>
              </div>
              <div>
                <span className="text-gray-500">{t("table.mobile.eps")}</span>
                <p className={`font-mono ${s.earnings_growth > 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.earnings_growth != null ? `${s.earnings_growth > 0 ? "+" : ""}${s.earnings_growth.toFixed(1)}%` : "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">{t("table.mobile.rev")}</span>
                <p className={`font-mono ${s.revenue_growth > 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.revenue_growth != null ? `${s.revenue_growth > 0 ? "+" : ""}${s.revenue_growth.toFixed(1)}%` : "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">{t("table.mobile.rating")}</span>
                <p><RecBadge rec={s.recommendation} mean={s.recommendation_mean} /></p>
              </div>
            </div>
            {expandedSymbol === s.symbol && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <Detail label={t("table.detail.sector")} value={s.sector} />
                <Detail label={t("table.detail.price")} value={s.current_price != null ? `$${s.current_price.toFixed(2)}` : "-"} />
                <Detail label={t("table.detail.52wHigh")} value={s.fifty_two_week_high != null ? `$${s.fifty_two_week_high.toFixed(2)}` : "-"} />
                <Detail label={t("table.detail.200dSma")} value={s.sma_200 != null ? `$${s.sma_200.toFixed(2)}` : "-"} />
                <Detail label={t("table.detail.pctOf200dma")} value={s.pct_from_200dma != null ? `${s.pct_from_200dma.toFixed(1)}%` : "-"} />
                <Detail label={t("table.detail.trailingPer")} value={s.trailing_pe != null ? s.trailing_pe.toFixed(2) : "-"} />
                <Detail label={t("table.detail.sectorAvgPer")} value={sectorAverages[s.sector] != null ? sectorAverages[s.sector].toFixed(2) : "-"} />
                <Detail label={t("table.detail.divYield")} value={s.dividend_yield != null ? `${s.dividend_yield.toFixed(2)}%` : "-"} />
                <Detail label={t("table.detail.beta")} value={s.beta != null ? s.beta.toFixed(2) : "-"} />
                <div className="col-span-2">
                  <AiSummary summary={s.ai_summary} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className={`px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap ${ALIGN_CLASS[col.align]}`}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="ml-1 text-blue-600">
                        {sortAsc ? "\u25B2" : "\u25BC"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <React.Fragment key={s.symbol}>
                  <tr
                    onClick={() =>
                      setExpandedSymbol(
                        expandedSymbol === s.symbol ? null : s.symbol,
                      )
                    }
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-left">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.symbol}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RsiBadge rsi={s.rsi} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {formatMarketCap(s.market_cap)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {s.pct_from_high != null ? `${s.pct_from_high.toFixed(1)}%` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {s.forward_pe != null ? s.forward_pe.toFixed(1) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.earnings_growth != null ? (
                        <span
                          className={
                            s.earnings_growth > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {s.earnings_growth > 0 ? "+" : ""}
                          {s.earnings_growth.toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.revenue_growth != null ? (
                        <span
                          className={
                            s.revenue_growth > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {s.revenue_growth > 0 ? "+" : ""}
                          {s.revenue_growth.toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RecBadge rec={s.recommendation} mean={s.recommendation_mean} />
                    </td>
                  </tr>
                  {expandedSymbol === s.symbol && (
                    <ExpandedRow
                      stock={s}
                      sectorAvg={sectorAverages[s.sector]}
                      colCount={columns.length}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
