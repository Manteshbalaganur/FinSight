import pandas as pd
import streamlit as st

from data import NEWS


st.set_page_config(page_title="News Feed", page_icon="📰", layout="wide")
st.markdown("""
<style>
.block-container { max-width: 1450px; padding-top: 2rem; }
.badge { display:inline-block; padding:3px 11px; border-radius:999px; font-size:.78rem; font-weight:600; margin-right:6px; color:#fff; }
.badge-company { background:#1f6feb; }
.badge-sector { background:#238636; }
.badge-positive { background:#1a7f4b; }
.badge-negative { background:#a02a2a; }
.badge-neutral  { background:#7a5b1a; }
.badge-high { background:#2d6b8a; }
.badge-medium { background:#4a4a52; }
.badge-low { background:#3a3a40; }
.news-card { background:#121d29; border:1px solid #26384d; border-radius:16px; padding:1.1rem 1.25rem; margin-bottom:1rem; }
.news-card h4 { color:#f5f7fa; margin:0.4rem 0 0.3rem; }
.news-card p { color:#c2d0df; line-height:1.6; margin:0.2rem 0; }
.meta { color:#8b9bb0; font-size:.8rem; }
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("## 📊 Portfolio Intelligence")
    st.caption("Page 2 · Portfolio-relevant news")
    st.info("Filter the feed by company, sector, or sentiment.")
    st.caption("Demo data — for academic review only. Not financial advice.")

st.title("📰 News Feed")
st.caption("Curated market stories with AI summaries and portfolio relevance signals.")

companies = sorted(set(n["company"] for n in NEWS))
sectors = sorted(set(n["sector"] for n in NEWS))
sentiments = ["Positive", "Negative", "Neutral"]

filter_cols = st.columns(3)
selected_company = filter_cols[0].selectbox("Company", ["All"] + companies)
selected_sector = filter_cols[1].selectbox("Sector", ["All"] + sectors)
selected_sentiment = filter_cols[2].selectbox("Sentiment", ["All"] + sentiments)

filtered = NEWS
if selected_company != "All":
    filtered = [n for n in filtered if n["company"] == selected_company]
if selected_sector != "All":
    filtered = [n for n in filtered if n["sector"] == selected_sector]
if selected_sentiment != "All":
    filtered = [n for n in filtered if n["sentiment"] == selected_sentiment]

st.markdown(f"#### Showing {len(filtered)} of {len(NEWS)} stories")

sentiment_emoji = {"Positive": "🟢 Positive", "Negative": "🔴 Negative", "Neutral": "🟡 Neutral"}
relevance_class = {"High": "badge-high", "Medium": "badge-medium", "Low": "badge-low"}

for item in filtered:
    sentiment_class = f"badge-{item['sentiment'].lower()}"
    st.markdown(f"""
    <div class="news-card">
      <span class="badge badge-company">{item['company']}</span>
      <span class="badge badge-sector">{item['sector']}</span>
      <span class="badge {sentiment_class}">{sentiment_emoji[item['sentiment']]}</span>
      <span class="badge {relevance_class[item['relevance']]}">Relevance: {item['relevance']}</span>
      <h4>{item['headline']}</h4>
      <p>{item['summary']}</p>
      <p class="meta">{item['source']} · {item['date']}</p>
    </div>
    """, unsafe_allow_html=True)
    with st.expander("Why is this relevant to my portfolio?"):
        st.markdown(f"**Portfolio connection:** {item['connection']}")
        st.markdown(f"**Impact analysis:** {item['impact']}")
