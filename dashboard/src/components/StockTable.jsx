import React, { useState } from "react";

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const COLUMNS = [
  { key: "name", label: "Name", align: "left" },
  { key: "rsi", label: "RSI", align: "right" },
  { key: "market_cap", label: "Market Cap", align: "right" },
  { key: "pct_from_high", label: "52W High %", align: "right" },
  { key: "forward_pe", label: "Fwd PER", align: "right" },
  { key: "earnings_growth", label: "EPS Growth", align: "right" },
  { key: "revenue_growth", label: "Rev Growth", align: "right" },
  { key: "recommendation", label: "Rating", align: "center" },
];

function formatMarketCap(v) {
  if (v == null) return "-";
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  return `${(v / 1e6).toFixed(0)}M`;
}

function RsiBadge({ rsi }) {
  if (rsi == null) return <span className="text-gray-400">-</span>;
  let color, label;
  if (rsi < 30) {
    color = "bg-red-100 text-red-700";
    label = "Oversold";
  } else if (rsi < 40) {
    color = "bg-orange-100 text-orange-700";
    label = "Weak";
  } else {
    color = "bg-gray-100 text-gray-600";
    label = "Neutral";
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {rsi.toFixed(1)} <span className="opacity-70">{label}</span>
    </span>
  );
}

function RecBadge({ rec, mean }) {
  if (!rec) return <span className="text-gray-400">-</span>;
  const labels = {
    strong_buy: { text: "Strong Buy", color: "bg-green-100 text-green-700" },
    buy: { text: "Buy", color: "bg-emerald-100 text-emerald-700" },
    hold: { text: "Hold", color: "bg-yellow-100 text-yellow-700" },
    sell: { text: "Sell", color: "bg-red-100 text-red-700" },
    strong_sell: { text: "Strong Sell", color: "bg-red-200 text-red-800" },
  };
  const info = labels[rec] || { text: rec, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.color}`}>
      {info.text}
      {mean != null && (
        <span className="ml-1 opacity-60">({mean.toFixed(1)})</span>
      )}
    </span>
  );
}

function ExpandedRow({ stock, sectorAvg }) {
  return (
    <tr className="bg-blue-50">
      <td colSpan={COLUMNS.length} className="px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Detail label="Symbol" value={stock.symbol} />
          <Detail label="Sector" value={stock.sector} />
          <Detail label="Sub-Industry" value={stock.sub_industry} />
          <Detail label="Price" value={stock.current_price != null ? `$${stock.current_price.toFixed(2)}` : "-"} />
          <Detail label="52W High" value={stock.fifty_two_week_high != null ? `$${stock.fifty_two_week_high.toFixed(2)}` : "-"} />
          <Detail label="Trailing PER" value={stock.trailing_pe != null ? stock.trailing_pe.toFixed(2) : "-"} />
          <Detail label="Sector Avg PER" value={sectorAvg != null ? sectorAvg.toFixed(2) : "-"} />
          <Detail label="200D SMA" value={stock.sma_200 != null ? `$${stock.sma_200.toFixed(2)}` : "-"} />
          <Detail label="% of 200DMA" value={stock.pct_from_200dma != null ? `${stock.pct_from_200dma.toFixed(1)}%` : "-"} />
          <Detail label="Dividend Yield" value={stock.dividend_yield != null ? `${stock.dividend_yield.toFixed(2)}%` : "-"} />
          <Detail label="Beta" value={stock.beta != null ? stock.beta.toFixed(2) : "-"} />
        </div>
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
  const [expandedSymbol, setExpandedSymbol] = useState(null);

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">
          조건에 맞는 종목이 없습니다. 필터를 조정해보세요.
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
                <span className="text-gray-500">Cap</span>
                <p className="font-mono text-gray-800">{formatMarketCap(s.market_cap)}</p>
              </div>
              <div>
                <span className="text-gray-500">52W %</span>
                <p className="font-mono text-gray-800">{s.pct_from_high != null ? `${s.pct_from_high.toFixed(1)}%` : "-"}</p>
              </div>
              <div>
                <span className="text-gray-500">Fwd PE</span>
                <p className="font-mono text-gray-800">{s.forward_pe != null ? s.forward_pe.toFixed(1) : "-"}</p>
              </div>
              <div>
                <span className="text-gray-500">EPS</span>
                <p className={`font-mono ${s.earnings_growth > 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.earnings_growth != null ? `${s.earnings_growth > 0 ? "+" : ""}${s.earnings_growth.toFixed(1)}%` : "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Rev</span>
                <p className={`font-mono ${s.revenue_growth > 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.revenue_growth != null ? `${s.revenue_growth > 0 ? "+" : ""}${s.revenue_growth.toFixed(1)}%` : "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Rating</span>
                <p><RecBadge rec={s.recommendation} mean={s.recommendation_mean} /></p>
              </div>
            </div>
            {expandedSymbol === s.symbol && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <Detail label="Sector" value={s.sector} />
                <Detail label="Price" value={s.current_price != null ? `$${s.current_price.toFixed(2)}` : "-"} />
                <Detail label="52W High" value={s.fifty_two_week_high != null ? `$${s.fifty_two_week_high.toFixed(2)}` : "-"} />
                <Detail label="200D SMA" value={s.sma_200 != null ? `$${s.sma_200.toFixed(2)}` : "-"} />
                <Detail label="% of 200DMA" value={s.pct_from_200dma != null ? `${s.pct_from_200dma.toFixed(1)}%` : "-"} />
                <Detail label="Trailing PER" value={s.trailing_pe != null ? s.trailing_pe.toFixed(2) : "-"} />
                <Detail label="Sector Avg PER" value={sectorAverages[s.sector] != null ? sectorAverages[s.sector].toFixed(2) : "-"} />
                <Detail label="Div Yield" value={s.dividend_yield != null ? `${s.dividend_yield.toFixed(2)}%` : "-"} />
                <Detail label="Beta" value={s.beta != null ? s.beta.toFixed(2) : "-"} />
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
                {COLUMNS.map((col) => (
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
