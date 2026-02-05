import { useState, useEffect, useMemo } from "react";
import FilterPanel from "./components/FilterPanel";
import StockTable from "./components/StockTable";
import SectorPERTable from "./components/SectorPERTable";
import InfoBox from "./components/InfoBox";

const DEFAULT_FILTERS = {
  rsi: 40,
  marketCap: 100,
  pctFromHigh: 65,
  epsGrowth: 0,
  revenueGrowth: 0,
  buyOnly: true,
  perBelowSector: true,
  above200dma: true,
  sector: "all",
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState("rsi");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch("/stock_data.json")
      .then((r) => {
        if (!r.ok) throw new Error("stock_data.json을 불러올 수 없습니다.");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sectors = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.stocks.map((s) => s.sector).filter(Boolean));
    return [...set].sort();
  }, [data]);

  const filteredStocks = useMemo(() => {
    if (!data) return [];
    return data.stocks.filter((s) => {
      if (s.rsi == null || s.rsi >= filters.rsi) return false;
      if (
        s.market_cap == null ||
        s.market_cap <= filters.marketCap * 1_000_000_000
      )
        return false;
      if (s.pct_from_high == null || s.pct_from_high <= filters.pctFromHigh)
        return false;
      if (s.earnings_growth == null || s.earnings_growth <= filters.epsGrowth)
        return false;
      if (s.revenue_growth == null || s.revenue_growth <= filters.revenueGrowth)
        return false;
      if (filters.above200dma && (s.pct_from_200dma == null || s.pct_from_200dma <= 80))
        return false;
      if (filters.buyOnly && (s.recommendation_mean == null || s.recommendation_mean > 2.5))
        return false;
      if (filters.perBelowSector) {
        if (
          s.forward_pe == null ||
          !data.sector_averages[s.sector] ||
          s.forward_pe >= data.sector_averages[s.sector]
        )
          return false;
      }
      if (filters.sector !== "all" && s.sector !== filters.sector) return false;
      return true;
    });
  }, [data, filters]);

  const sortedStocks = useMemo(() => {
    const list = [...filteredStocks];
    list.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string") {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [filteredStocks, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-700 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-500 mt-3">
            screener.py를 실행하여 stock_data.json을 생성해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">
            S&P 500 Stock Screener
          </h1>
          {data.metadata && data.metadata.sp500_above_200dma != null && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                data.metadata.sp500_above_200dma
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {data.metadata.sp500_above_200dma
                ? "S&P500 상승 추세"
                : "S&P500 하락 추세 — 매수 대기 권장"}
            </span>
          )}
        </div>
        {data.metadata && (
          <p className="text-sm text-gray-500 mt-1">
            수집: {new Date(data.metadata.collected_at).toLocaleString()} | 전체{" "}
            {data.metadata.total_collected}종목 중 필터 통과{" "}
            {data.metadata.passed_filter}종목
            {data.metadata.sp500_price != null && data.metadata.sp500_200dma != null && (
              <span className="ml-2">
                | S&P500 {data.metadata.sp500_price.toLocaleString()} (200DMA{" "}
                {data.metadata.sp500_200dma.toLocaleString()})
              </span>
            )}
          </p>
        )}
      </header>

      <div className="flex">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          sectors={sectors}
          defaultFilters={DEFAULT_FILTERS}
          resultCount={sortedStocks.length}
        />

        <main className="flex-1 p-6 overflow-auto">
          <StockTable
            stocks={sortedStocks}
            sortKey={sortKey}
            sortAsc={sortAsc}
            onSort={handleSort}
            sectorAverages={data.sector_averages}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectorPERTable sectorAverages={data.sector_averages} />
            <InfoBox />
          </div>
        </main>
      </div>
    </div>
  );
}
