# Stock Price Prediction Using News Sentiment Analysis (PortfolioAI / FinSight)

Academic prototype. A Next.js 14 (App Router, TypeScript) frontend talks over HTTP to a small Python FastAPI backend.
All market data, news, sentiment, predictions and chatbot answers are fetched live. Nothing shown as live data is hardcoded.
Predictions are experimental estimates, not financial advice.

```
app/ components/ lib/      Next.js frontend (lib/api.ts is the single API layer)
backend/app/               FastAPI backend (routes/ services/ core/ schemas/)
```

## Run it (two terminals)

**Terminal 1: backend**
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        (then edit .env and paste your OpenAI key)
uvicorn app.main:app --reload --port 8000
```
Swagger docs: http://localhost:8000/docs  ·  Status/model check: http://localhost:8000/api/health

**Terminal 2: frontend**
```
npm install
npm run dev
```
Open http://localhost:3000. The backend URL is in `.env.local` (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`; see `.env.local.example`).

### OpenAI key
Put it only in `backend/.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=http://localhost:3000
```
The key never reaches the browser and is not prefixed with `NEXT_PUBLIC_`. `OPENAI_MODEL` can be any chat model your account can use that
supports JSON-schema structured output. I could not verify model availability without your key; open `/api/health` after adding it, which
calls the OpenAI models API and reports whether the model exists. There is no silent fallback to another model.
Without a key the backend still starts; stock data, charts, news and the technical part of predictions work, and sentiment/chat return a clear 503 message.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/stocks/{symbol}` | latest quote, previous close, change, OHLC, volume, 52-week range, data timestamp, market-open note |
| GET | `/api/stocks/{symbol}/history?period=1D\|1W\|1M\|3M\|6M\|1Y\|5Y` | chart time series |
| GET | `/api/stocks/search?q=` | search by ticker or company name |
| GET | `/api/stocks/quotes?symbols=a,b` | batch quotes (one Yahoo request) |
| GET | `/api/stocks/supported` | demo stock list |
| GET | `/api/news?symbol=&company=&category=&limit=` | Google News RSS articles, filtered for relevance to the company |
| POST | `/api/sentiment/analyze` | OpenAI sentiment (one batched structured-JSON call) |
| POST | `/api/predictions/{symbol}` | Random Forest estimate, horizon 1, 5 or 7 trading days |
| POST | `/api/chat` | chatbot with live data context |
| GET | `/api/market/overview` | indices, top gainers/losers over the supported list |
| GET | `/api/health` | backend and OpenAI configuration check |

Indian stocks use the `.NS` suffix (`TCS.NS`). `TATAMOTORS.NS` no longer exists on Yahoo since the 2025 demerger, so it is aliased to `TMPV.NS`.

## How it maps to the frontend
| Frontend | Source |
|---|---|
| Overview and Portfolio (prices, P/L, allocation, top movers, 30-day value chart) | `/stocks/quotes`, `/stocks/{s}/history` combined with your positions in `lib/holdings.ts` |
| News Feed, Overview news | `/news` per holding, then `/sentiment/analyze` |
| Sentiment page | sentiment results, plus price history for the chart |
| Prediction page | `/predictions/{symbol}` (stock and horizon selectors) |
| AI Assistant | `/chat` (history and portfolio positions sent with each message) |
| Top bar search | `/stocks/search`; selecting opens the new `/stock/[symbol]` detail page (quote, period chart, news, sentiment) |

**Your positions** (quantity, buy price, sector) are user input in `lib/holdings.ts`, not market data. The sample buy prices there are placeholders and
differ a lot from current prices, so the P/L looks very negative. Replace them with your own.

## Sentiment
One OpenAI request per stock classifies all its articles (max 15) with a strict JSON schema. Per article: label, score (+1 / 0 / -1), explanation, impact, relevance.
Python (not the LLM) computes the percentages and overall score (mean, range -1 to +1; above +0.15 Positive, below -0.15 Negative). Results are cached 6 hours by article set.

## How the prediction works
- Data: up to 5 years of daily Yahoo Finance prices.
- Features per day: 1/2/5/10-day returns, price gap to 5/10/20/50-day moving averages, RSI(14), volume / 20-day average volume, 10-day volatility.
- Target: the return over the chosen horizon (1, 5 or 7 trading days).
- Training: chronological 80/20 split (no shuffling; the last `horizon` training rows are dropped to avoid overlap with the test period).
  `RandomForestRegressor(200 trees, max_depth 6, min_samples_leaf 5)` is compared with a Ridge regression and an "always up" baseline on the held-out 20%
  (directional accuracy and RMSE). The chart shows the last 30 out-of-sample predictions against actual prices. The final model is refit on all data to forecast from the latest bar.
- News sentiment: there is no historical sentiment series to train on, so sentiment is not a learned feature. The current OpenAI sentiment score shifts the forecast by
  `0.25 x score x expected move size` (heuristic). It is reported separately as the "news sentiment contribution".
- Direction is NEUTRAL when the estimated move is below 0.2 expected-move sizes.
- Expect backtest accuracy near 50%. That is normal for daily stock data and the page says so. Fewer than ~200 usable trading days returns an error.

## Chatbot
`/api/chat` detects stocks in the message (and any portfolio question), fetches quote, indicators, headlines, and (only when the question asks) sentiment and prediction,
and passes them to OpenAI labelled as verified data / news / AI sentiment / model prediction, with your system prompt. Responses are plain JSON (no streaming). The last 10 messages are sent as history.

## Caching
In-memory TTL cache: quotes 60 s, history 5 min, news 10 min (stale copy used if the feed fails, flagged `stale`), sentiment 6 h, models 15 min. The frontend also memoises calls.

## Limitations
- Yahoo Finance via `yfinance` is unofficial, can be delayed (up to ~15 min) or rate-limited, and is not tick-by-tick. Responses include the data timestamp and market-open note.
- Google News RSS gives headlines and sources but usually no article summary, so cards show no summary text. Sentiment uses headlines only. Roughly the last 7 days are available, so the sentiment-vs-price chart only has points on days with articles.
- Top gainers/losers cover only the 13 supported stocks, not the whole market.
- Search outside the supported list is best-effort through Yahoo and may return nothing.
- OpenAI features need a funded key. In-memory caches reset on restart.
- Predictions are experimental, have little predictive power, and are not financial advice.

## Notes
- If port 3000 is busy, Next.js moves to 3001; the backend CORS accepts any localhost port.
- `pages/*.py` are leftover Streamlit files from an earlier prototype and are not used.
