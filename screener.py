"""S&P 500 Stock Screener - 가치투자 필터링"""

import json
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import requests
import yfinance as yf
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

OUTPUT_PATH = Path(__file__).parent / "stock_data.json"
DASHBOARD_PATH = Path(__file__).parent / "dashboard" / "public" / "stock_data.json"


def get_sp500_tickers() -> list[dict]:
    """Wikipedia에서 S&P 500 종목 목록을 가져온다."""
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {"User-Agent": "SP500Screener/1.0 (educational)"}
    resp = requests.get(url, timeout=30, headers=headers)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    table = soup.find("table", {"id": "constituents"})
    if table is None:
        raise ValueError("Could not find S&P 500 constituents table on Wikipedia page")
    rows = table.find_all("tr")[1:]

    tickers = []
    for row in rows:
        cols = row.find_all("td")
        if len(cols) >= 4:
            symbol = cols[0].text.strip().replace(".", "-")
            name = cols[1].text.strip()
            sector = cols[2].text.strip()
            sub_industry = cols[3].text.strip()
            tickers.append({
                "symbol": symbol,
                "name": name,
                "sector": sector,
                "sub_industry": sub_industry,
            })
    logger.info("S&P 500 종목 %d개 수집", len(tickers))
    return tickers


def compute_rsi(closes: pd.Series, period: int = 14) -> float | None:
    """RSI(14)를 계산한다."""
    if len(closes) < period + 1:
        return None
    delta = closes.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)

    avg_gain = gain.ewm(alpha=1 / period, min_periods=period).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    val = rsi.iloc[-1]
    if pd.isna(val) or not np.isfinite(val):
        return None
    return round(float(val), 2)


def fetch_stock_data(ticker_info: dict) -> dict | None:
    """개별 종목의 재무 데이터를 수집한다."""
    symbol = ticker_info["symbol"]
    try:
        tk = yf.Ticker(symbol)
        info = tk.info

        if info.get("quoteType") not in ("EQUITY",):
            return None

        exchange = info.get("exchange", "")
        if exchange in ("PNK", "OTC"):
            return None

        hist = tk.history(period="1y")
        if hist.empty or "Close" not in hist.columns:
            return None

        rsi = compute_rsi(hist["Close"])
        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        fifty_two_week_high = info.get("fiftyTwoWeekHigh")

        pct_from_high = None
        if current_price and fifty_two_week_high and fifty_two_week_high > 0:
            pct_from_high = round(current_price / fifty_two_week_high * 100, 2)

        # 200일 SMA 계산
        closes_200 = hist["Close"].tail(200)
        raw_sma = closes_200.mean()
        sma_200 = None
        pct_from_200dma = None
        if len(closes_200) >= 200 and pd.notna(raw_sma) and np.isfinite(raw_sma):
            sma_200 = round(float(raw_sma), 2)
            if current_price and sma_200 > 0:
                pct_from_200dma = round(current_price / sma_200 * 100, 2)

        market_cap = info.get("marketCap")
        forward_pe = info.get("forwardPE")
        earnings_growth = info.get("earningsGrowth")
        revenue_growth = info.get("revenueGrowth")
        recommendation = info.get("recommendationKey", "")
        recommendation_mean = info.get("recommendationMean")
        trailing_pe = info.get("trailingPE")
        dividend_yield = info.get("dividendYield")
        beta = info.get("beta")

        return {
            "symbol": symbol,
            "name": ticker_info["name"],
            "sector": ticker_info["sector"],
            "sub_industry": ticker_info["sub_industry"],
            "current_price": current_price,
            "market_cap": market_cap,
            "forward_pe": forward_pe,
            "trailing_pe": trailing_pe,
            "earnings_growth": round(earnings_growth * 100, 2) if earnings_growth is not None and np.isfinite(earnings_growth) else None,
            "revenue_growth": round(revenue_growth * 100, 2) if revenue_growth is not None and np.isfinite(revenue_growth) else None,
            "rsi": rsi,
            "sma_200": sma_200,
            "pct_from_200dma": pct_from_200dma,
            "fifty_two_week_high": fifty_two_week_high,
            "pct_from_high": pct_from_high,
            "recommendation": recommendation,
            "recommendation_mean": recommendation_mean,
            "dividend_yield": round(dividend_yield * 100, 2) if dividend_yield is not None and np.isfinite(dividend_yield) else None,
            "beta": round(float(beta), 2) if beta is not None and np.isfinite(beta) else None,
        }
    except (requests.RequestException, KeyError, ValueError, TypeError) as e:
        logger.warning("종목 %s 수집 실패: %s", symbol, e)
        return None


def compute_sector_averages(stocks: list[dict]) -> dict:
    """섹터별 평균 Forward PER을 계산한다."""
    sector_pes: dict[str, list[float]] = {}
    for s in stocks:
        fpe = s.get("forward_pe")
        sector = s.get("sector")
        if fpe is not None and sector and fpe > 0:
            sector_pes.setdefault(sector, []).append(fpe)

    return {
        sector: round(sum(vals) / len(vals), 2)
        for sector, vals in sector_pes.items()
        if vals
    }


def apply_default_filters(stocks: list[dict], sector_avgs: dict) -> list[dict]:
    """기본 9개 필터를 적용한다."""
    passed = []
    for s in stocks:
        rsi = s.get("rsi")
        mc = s.get("market_cap")
        rec_mean = s.get("recommendation_mean")
        eg = s.get("earnings_growth")
        rg = s.get("revenue_growth")
        fpe = s.get("forward_pe")
        pct = s.get("pct_from_high")
        pct_200 = s.get("pct_from_200dma")
        sector = s.get("sector")

        if rsi is None or rsi >= 40:
            continue
        if mc is None or mc <= 100_000_000_000:
            continue
        if rec_mean is None or rec_mean > 2.5:
            continue
        if eg is None or eg <= 0:
            continue
        if rg is None or rg <= 0:
            continue
        if fpe is None or sector not in sector_avgs or fpe >= sector_avgs[sector]:
            continue
        if pct is None or pct <= 65:
            continue
        if pct_200 is None or pct_200 <= 80:
            continue

        passed.append({**s, "passed_filter": True})

    return passed


def main() -> None:
    logger.info("S&P 500 스크리너 시작")
    tickers = get_sp500_tickers()

    all_stocks = []
    total = len(tickers)
    for i, t in enumerate(tickers, 1):
        logger.info("[%d/%d] %s 수집 중...", i, total, t["symbol"])
        data = fetch_stock_data(t)
        if data:
            all_stocks.append(data)
        if i % 10 == 0:
            time.sleep(1)

    logger.info("수집 완료: %d / %d 종목", len(all_stocks), total)

    # S&P 500 지수 200일 SMA 계산
    sp500_price = None
    sp500_200dma = None
    sp500_above_200dma = None
    try:
        sp500_hist = yf.Ticker("^GSPC").history(period="1y")
        if not sp500_hist.empty and "Close" in sp500_hist.columns:
            raw_price = sp500_hist["Close"].iloc[-1]
            if pd.notna(raw_price) and np.isfinite(raw_price):
                sp500_price = round(float(raw_price), 2)
            sp500_closes_200 = sp500_hist["Close"].tail(200)
            raw_sp500_sma = sp500_closes_200.mean()
            if len(sp500_closes_200) >= 200 and pd.notna(raw_sp500_sma) and np.isfinite(raw_sp500_sma):
                sp500_200dma = round(float(raw_sp500_sma), 2)
                if sp500_price is not None:
                    sp500_above_200dma = sp500_price > sp500_200dma
    except (requests.RequestException, KeyError, ValueError, TypeError) as e:
        logger.warning("S&P 500 지수 데이터 수집 실패: %s", e)

    sector_avgs = compute_sector_averages(all_stocks)
    passed = apply_default_filters(all_stocks, sector_avgs)
    logger.info("필터 통과: %d 종목", len(passed))

    passed_symbols = {s["symbol"] for s in passed}
    for s in all_stocks:
        s["passed_filter"] = s["symbol"] in passed_symbols

    output = {
        "metadata": {
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "total_collected": len(all_stocks),
            "passed_filter": len(passed),
            "sp500_price": sp500_price,
            "sp500_200dma": sp500_200dma,
            "sp500_above_200dma": sp500_above_200dma,
        },
        "sector_averages": sector_avgs,
        "stocks": all_stocks,
    }

    for path in (OUTPUT_PATH, DASHBOARD_PATH):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        logger.info("저장 완료: %s", path)

    logger.info("스크리너 완료")


if __name__ == "__main__":
    main()
