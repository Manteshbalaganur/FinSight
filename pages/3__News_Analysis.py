import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from data import NEWS, portfolio_dataframe


st.set_page_config(page_title="News Analysis", page_icon="🔍", layout="wide")
st.markdown("""
<style>
.block-container { max-width: 1450px; padding-top: 2rem; }
.flow { background:#121d29; border:1px solid #26384d; border-radius:16px; padding:1.5rem; text-align:center; }
.flow-step { display:inline-block; background:#172334; border:1px solid #2d5361; border-radius:12px; padding:.75rem 1.1rem; margin:6px 4px; color:#f5f7fa; font-weight:600; }
.arrow { color:#53d6b3; font-size:1.6rem; vertical-align:middle; padding:0 4px; }
.section-card { background:#121d29; border:1px solid #26384d; border-radius:16px; padding:1.25rem; }
.section-card h3 { color:#f5f7fa; margin-top:0; }
.section-card p { color:#c2d0df; line-height:1.7; }
.badge { display:inline-block; padding:3px 11px; border-radius:999px; font-size:.78rem; font-weight:600; color:#fff; margin-right:6px; }
.badge-positive { background:#1a7f4b; }
.badge-negative { background:#a02a2a; }
.badge-neutral  { background:#7a5b1a; }
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("## 📊 Portfolio Intelligence")
    st.caption("Page 3 · Deep news analysis")
    st.info("Trace one story from market event to affected holdings.")
    st.caption("Demo data — for academic review only. Not financial advice.")

st.title("🔍 News Analysis")
st.caption("Select a story to explore its AI summary, sentiment, and portfolio impact.")

options = {f"{i+1}. {n['headline']}": i for i, n in enumerate(NEWS)}
selected_key = st.selectbox("Choose a news article", list(options.keys()))
item = NEWS[options[selected_key]]

st.markdown(f"### {item['headline']}")
st.markdown(f"<span class='badge badge-{item['sentiment'].lower()}'>{item['sentiment']}</span> <span style='color:#8b9bb0'>{item['source']} · {item['date']}</span>", unsafe_allow_html=True)

st.markdown("#### Event → Portfolio flow")
st.markdown(f"""
<div class="flow">
  <span class="flow-step">📰 News Event</span><span class="arrow">→</span>
  <span class="flow-step">{item['company']}</span><span class="arrow">→</span>
  <span class="flow-step">{item['sector']}</span><span class="arrow">→</span>
  <span class="flow-step">Your Portfolio</span>
</div>
""", unsafe_allow_html=True)

left, right = st.columns([1.3, 1])
with left:
    st.markdown("##### Full Article")
    st.markdown(f'<div class="section-card"><p>{item["article"]}</p></div>', unsafe_allow_html=True)
    st.markdown("##### AI Summary")
    st.markdown(f'<div class="section-card"><p>{item["summary"]}</p></div>', unsafe_allow_html=True)
with right:
    st.markdown("##### Sentiment Gauge")
    gauge = go.Figure(go.Indicator(
        mode="gauge+number", value=item["score"], number={"suffix": "", "font": {"color": "#f5f7fa"}},
        domain={"x": [0, 1], "y": [0, 1]},
        gauge={"axis": {"range": [-1, 1], "tickcolor": "#9fb3c8"}, "bar": {"color": "#47d7ac"},
               "steps": [{"range": [-1, -0.25], "color": "#3a1f1f"}, {"range": [-0.25, 0.25], "color": "#3a3a1f"}, {"range": [0.25, 1], "color": "#1f3a2a"}]},
    ))
    gauge.update_layout(template="plotly_dark", height=240, margin=dict(t=20, b=20, l=20, r=20))
    st.plotly_chart(gauge, use_container_width=True)

st.markdown("##### Impact Analysis")
st.markdown(f'<div class="section-card"><p>{item["impact"]}</p></div>', unsafe_allow_html=True)

st.markdown("##### Portfolio Connection")
st.markdown(f'<div class="section-card"><p>{item["connection"]}</p></div>', unsafe_allow_html=True)

st.markdown("##### Affected Holdings")
frame = portfolio_dataframe()
rows = []
for symbol, sector, relation, impact_label in item["affected"]:
    match = frame[frame["Symbol"] == symbol].iloc[0]
    rows.append({
        "Symbol": symbol, "Sector": sector, "Relation": relation, "Impact": impact_label,
        "Qty": int(match["Qty"]), "Current Value": match["Current Value"], "Weight": match["Current Value"] / frame["Current Value"].sum() * 100,
    })
st.dataframe(pd.DataFrame(rows).style.format({"Current Value": "₹{:,.0f}", "Weight": "{:.1f}%"}), use_container_width=True, hide_index=True)
