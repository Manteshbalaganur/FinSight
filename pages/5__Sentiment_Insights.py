import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from data import NEWS, portfolio_dataframe


st.set_page_config(page_title="Sentiment Insights", page_icon="📊", layout="wide")
st.markdown("""
<style>
.block-container { max-width: 1450px; padding-top: 2rem; }
.note { background:#121d29; border:1px solid #26384d; border-radius:14px; padding:1rem 1.25rem; color:#c2d0df; }
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("## 📊 Portfolio Intelligence")
    st.caption("Page 5 · Sentiment Insights")
    st.info("Bridge to the Phase 2 stock-prediction pipeline.")
    st.caption("Demo data — for academic review only. Not financial advice.")

st.title("📊 Sentiment Insights")
st.caption("Aggregate sentiment signals from the news feed and their simulated relationship with stock prices.")

st.markdown("### Sentiment distribution")
counts = pd.Series([n["sentiment"] for n in NEWS]).value_counts().reindex(["Positive", "Negative", "Neutral"], fill_value=0).reset_index()
counts.columns = ["Sentiment", "Count"]
bar = px.bar(counts, x="Sentiment", y="Count", text="Count", template="plotly_dark", color="Sentiment", color_discrete_map={"Positive": "#47d7ac", "Negative": "#ef6b73", "Neutral": "#f4b860"})
bar.update_traces(textposition="outside", marker_line_width=0)
bar.update_layout(yaxis_title="News count", xaxis_title="", margin=dict(t=20, b=20, l=10, r=10), showlegend=False)
st.plotly_chart(bar, use_container_width=True)

st.markdown("### Sentiment score heatmap by stock")
frame = portfolio_dataframe()
symbols = frame["Symbol"].tolist()
news_by_symbol = {symbol: [n for n in NEWS if any(a[0] == symbol for a in n["affected"])] for symbol in symbols}
heatmap = pd.DataFrame(0.0, index=symbols, columns=["Positive", "Negative", "Neutral"], dtype=float)
for symbol, items in news_by_symbol.items():
    for n in items:
        heatmap.loc[symbol, n["sentiment"]] = n["score"]
fig = px.imshow(heatmap, text_auto=".2f", template="plotly_dark", color_continuous_scale="RdYlGn", aspect="auto", labels=dict(color="Score"))
fig.update_layout(margin=dict(t=20, b=20, l=10, r=10), coloraxis_colorbar=dict(title="Score"))
st.plotly_chart(fig, use_container_width=True)

st.markdown("### Sentiment trend vs stock price (simulated)")
@st.cache_data
def trend_series() -> pd.DataFrame:
    rng = np.random.default_rng(7)
    days = pd.date_range(end=pd.Timestamp.today().normalize(), periods=30)
    sentiment = np.clip(rng.normal(0.15, 0.25, 30).cumsum() / 6 + 0.2, -1, 1)
    price = 4100 * np.cumprod(1 + rng.normal(0.001, 0.012, 30))
    return pd.DataFrame({"Date": days, "Sentiment": sentiment, "Price": price})

trend = trend_series()
dual = go.Figure()
dual.add_trace(go.Scatter(x=trend["Date"], y=trend["Sentiment"], name="Sentiment score", yaxis="y1", line=dict(color="#47d7ac", width=3)))
dual.add_trace(go.Scatter(x=trend["Date"], y=trend["Price"], name="Stock price", yaxis="y2", line=dict(color="#4c9aff", width=3)))
dual.update_layout(template="plotly_dark", margin=dict(t=20, b=20, l=60, r=60), legend=dict(orientation="h", y=1.1),
    yaxis=dict(title="Sentiment", range=[-1, 1], side="left", tickfont=dict(color="#47d7ac")),
    yaxis2=dict(title="Price", side="right", overlaying="y", tickfont=dict(color="#4c9aff"), tickprefix="₹"))
st.plotly_chart(dual, use_container_width=True)

st.markdown('<div class="note">This module will connect to the ML prediction pipeline in Phase 2.</div>', unsafe_allow_html=True)
