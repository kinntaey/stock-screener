import { useState, useMemo, useEffect } from "react";

export default function StockSearch({ stocks }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim() || !stocks) return [];
    const q = query.toUpperCase();
    return stocks
      .filter(
        (s) =>
          s.symbol?.toUpperCase().includes(q) ||
          (s.name && s.name.toUpperCase().includes(q))
      )
      .slice(0, 8);
  }, [stocks, query]);

  const handleSelect = (stock) => {
    setSelected(stock);
    setQuery("");
    setHighlightIndex(0);
  };

  useEffect(() => {
    const handleGlobalEscape = (e) => {
      if (e.key === "Escape") {
        setQuery("");
        setSelected(null);
        setHighlightIndex(0);
      }
    };
    window.addEventListener("keydown", handleGlobalEscape);
    return () => window.removeEventListener("keydown", handleGlobalEscape);
  }, []);

  const handleKeyDown = (e) => {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setQuery("");
      setHighlightIndex(0);
    }
  };

  const formatNum = (val, suffix = "") => {
    if (val == null) return "-";
    return val.toFixed(2) + suffix;
  };

  const formatCap = (val) => {
    if (val == null) return "-";
    if (val >= 1e12) return (val / 1e12).toFixed(1) + "T";
    if (val >= 1e9) return (val / 1e9).toFixed(1) + "B";
    if (val >= 1e6) return (val / 1e6).toFixed(1) + "M";
    return val.toLocaleString();
  };

  const formatRating = (val) => {
    if (val == null) return "-";
    let label;
    if (val <= 1.5) label = "Strong Buy";
    else if (val <= 2.5) label = "Buy";
    else if (val <= 3.5) label = "Hold";
    else if (val <= 4.5) label = "Sell";
    else label = "Strong Sell";
    return `${label}(${val.toFixed(1)})`;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setHighlightIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="종목 검색 (티커 또는 이름)"
          className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {results.length > 0 && !selected && (
        <ul className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-auto">
          {results.map((s, idx) => (
            <li
              key={s.symbol}
              onClick={() => handleSelect(s)}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${idx === highlightIndex ? "bg-blue-100" : "hover:bg-blue-50"}`}
            >
              <span className="font-semibold text-blue-700">{s.symbol}</span>
              <span className="text-gray-600 ml-2 text-sm">{s.name}</span>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="absolute top-full right-0 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selected.ticker}</h3>
              <p className="text-sm text-gray-600">{selected.name}</p>
              <p className="text-xs text-gray-400">{selected.sector}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">RSI (14)</span>
              <span className={`font-mono text-right flex-1 ${selected.rsi < 30 ? "text-green-600" : selected.rsi > 70 ? "text-red-600" : "text-gray-900"}`}>
                {formatNum(selected.rsi)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">Price</span>
              <span className="font-mono text-gray-900 text-right flex-1">${formatNum(selected.current_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">Market Cap</span>
              <span className="font-mono text-gray-900 text-right flex-1">{formatCap(selected.market_cap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">52W High %</span>
              <span className="font-mono text-gray-900 text-right flex-1">{formatNum(selected.pct_from_high, "%")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">Forward P/E</span>
              <span className="font-mono text-gray-900 text-right flex-1">{formatNum(selected.forward_pe)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">200DMA %</span>
              <span className="font-mono text-gray-900 text-right flex-1">{formatNum(selected.pct_from_200dma, "%")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">EPS Growth</span>
              <span className={`font-mono text-right flex-1 ${selected.earnings_growth > 0 ? "text-green-600" : "text-red-600"}`}>
                {formatNum(selected.earnings_growth, "%")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">Rev Growth</span>
              <span className={`font-mono text-right flex-1 ${selected.revenue_growth > 0 ? "text-green-600" : "text-red-600"}`}>
                {formatNum(selected.revenue_growth, "%")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">Analyst</span>
              <span className="font-mono text-gray-900 text-right flex-1 text-xs">{formatRating(selected.recommendation_mean)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 w-20">Div Yield</span>
              <span className="font-mono text-gray-900 text-right flex-1">{formatNum(selected.dividend_yield, "%")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
