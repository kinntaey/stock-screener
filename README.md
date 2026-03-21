# S&P 500 Oversold & Undervalued Screener

A value investing screener that automatically filters oversold and undervalued stocks from the S&P 500.

**[Live Dashboard](https://kinntaey.github.io/stock-screener/)**

## Filters

| # | Filter | Condition |
|---|--------|-----------|
| 1 | RSI (14) | < 40 |
| 2 | Market Cap | > $100B |
| 3 | Analyst Rating | ≤ 2.5 (Buy or better) |
| 4 | EPS Growth | > 0% |
| 5 | Revenue Growth | > 0% |
| 6 | Forward PER | Below sector average |
| 7 | % from 52W High | > 65% |
| 8 | % from 200 DMA | > 80% |

## Tech Stack

- **Screener**: Python (yfinance, pandas, BeautifulSoup)
- **Dashboard**: React 18 + Vite + Tailwind CSS v3
- **Deploy**: GitHub Actions → GitHub Pages (auto-update weekdays at 22:00 UTC)

## Usage

### Run Screener

```bash
pip install -r requirements.txt
python screener.py
```

### Run Dashboard (dev)

```bash
cd dashboard
npm install
npm run dev
```

## Data Flow

```
Wikipedia (S&P 500 list) → yfinance (financials) → screener.py → stock_data.json → React Dashboard
```

## License

MIT
