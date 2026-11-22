"""Supported stock universe used for search, market overview and news relevance."""

# keywords: words that must appear in a news headline for it to count as relevant.
SUPPORTED_STOCKS: list[dict] = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "market": "India", "keywords": ["reliance"]},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "market": "India", "keywords": ["tcs", "tata consultancy"]},
    {"symbol": "INFY.NS", "name": "Infosys", "market": "India", "keywords": ["infosys"]},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "market": "India", "keywords": ["hdfc bank", "hdfc"]},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "market": "India", "keywords": ["icici"]},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "market": "India", "keywords": ["sbi", "state bank"]},
    {"symbol": "TMPV.NS", "name": "Tata Motors", "market": "India", "keywords": ["tata motors", "tmpv", "jaguar land rover"]},
    {"symbol": "AAPL", "name": "Apple", "market": "US", "keywords": ["apple", "aapl", "iphone"]},
    {"symbol": "MSFT", "name": "Microsoft", "market": "US", "keywords": ["microsoft", "msft"]},
    {"symbol": "GOOGL", "name": "Alphabet (Google)", "market": "US", "keywords": ["google", "alphabet", "googl"]},
    {"symbol": "AMZN", "name": "Amazon", "market": "US", "keywords": ["amazon", "amzn", "aws"]},
    {"symbol": "NVDA", "name": "NVIDIA", "market": "US", "keywords": ["nvidia", "nvda"]},
    {"symbol": "TSLA", "name": "Tesla", "market": "US", "keywords": ["tesla", "tsla"]},
]

INDICES = [
    {"symbol": "^NSEI", "name": "NIFTY 50"},
    {"symbol": "^BSESN", "name": "BSE SENSEX"},
    {"symbol": "^GSPC", "name": "S&P 500"},
    {"symbol": "^IXIC", "name": "NASDAQ Composite"},
]

_BY_SYMBOL = {s["symbol"]: s for s in SUPPORTED_STOCKS}

# Yahoo no longer serves TATAMOTORS.NS since the 2025 demerger; the listed company is now TMPV.NS.
ALIASES = {"TATAMOTORS.NS": "TMPV.NS", "TATAMOTORS": "TMPV.NS"}


def normalize_symbol(symbol: str) -> str:
    """Upper-case; map a bare Indian ticker such as 'TCS' to 'TCS.NS' when it is a known stock."""
    s = ALIASES.get(symbol.strip().upper(), symbol.strip().upper())
    if s in _BY_SYMBOL:
        return s
    if f"{s}.NS" in _BY_SYMBOL:
        return f"{s}.NS"
    return s


def get_supported(symbol: str) -> dict | None:
    return _BY_SYMBOL.get(normalize_symbol(symbol))


def is_indian(symbol: str) -> bool:
    return symbol.upper().endswith((".NS", ".BO")) or symbol.startswith("^NSEI") or symbol.startswith("^BSESN")

