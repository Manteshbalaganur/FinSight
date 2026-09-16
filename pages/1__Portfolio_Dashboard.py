import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

from data import portfolio_dataframe, total_invested, total_profit, total_value


st.set_page_config(page_title="Portfolio Dashboard", page_icon="📈", layout="wide")
st.markdown("""
<style>
.block-container { max-width: 1450px; padding-top: 2rem; }
[data-testid="stMetric"] { background:#121d29; border:1px solid #26384d; padding:1rem; border-radius:14px; }
.section-card { background:#121d29; border:1px solid #26384d; border-radius:16px; padding:1rem; }
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("## 📊 Portfolio Intelligence")
    st.caption("Page 1 · Holdings and allocation")
    st.info("Explore the portfolio mix, returns, and simulated performance trend.")
    st.caption("Demo data — for academic review only. Not financial advice.")

st.title("📈 Portfolio Dashboard")
st.caption("A transparent view of the demo user's current holdings and simulated performance.")

frame = portfolio_dataframe()
value = total_value()
invested = total_invested()
profit = total_profit()

metrics = st.columns(4)
metrics[0].metric("Current value", f"₹{value:,.0f}")
metrics[1].metric("Invested capital", f"₹{invested:,.0f}")
metrics[2].metric("Total P/L", f"₹{profit:,.0f}", delta=f"₹{profit:,.0f}")
metrics[3].metric("Return", f"{profit / invested * 100:.1f}%", delta=f"{profit / invested * 100:.1f}%")

st.markdown("## Holdings")
display = frame[["Stock", "Symbol", "Qty", "Buy Price", "Current Price", "Invested", "Current Value", "P/L", "P/L %", "Sector"]].copy()
st.dataframe(
    display.style.format({"Buy Price": "₹{:,.0f}", "Current Price": "₹{:,.0f}", "Invested": "₹{:,.0f}", "Current Value": "₹{:,.0f}", "P/L": "₹{:,.0f}", "P/L %": "{:.1f}%"}).map(
        lambda value: "color: #45d483; font-weight: 600" if value > 0 else "color: #ff6b6b; font-weight: 600", subset=["P/L", "P/L %"]
    ),
    use_container_width=True,
    hide_index=True,
)

left, right = st.columns(2)
with left:
    st.markdown("### Stock-wise allocation")
    stock_chart = px.pie(frame, values="Current Value", names="Symbol", hole=0.48, template="plotly_dark", color_discrete_sequence=["#47d7ac", "#4c9aff", "#f4b860", "#ef6b73", "#a5b4fc"])
    stock_chart.update_layout(margin=dict(t=20, b=20, l=10, r=10), legend_title_text="Holding")
    st.plotly_chart(stock_chart, use_container_width=True)
with right:
    st.markdown("### Sector-wise allocation")
    sector = frame.groupby("Sector", as_index=False)["Current Value"].sum()
    sector_chart = px.pie(sector, values="Current Value", names="Sector", hole=0.48, template="plotly_dark", color_discrete_sequence=["#4c9aff", "#47d7ac", "#f4b860", "#ef6b73"])
    sector_chart.update_layout(margin=dict(t=20, b=20, l=10, r=10), legend_title_text="Sector")
    st.plotly_chart(sector_chart, use_container_width=True)

st.markdown("### Simulated 30-day portfolio performance")
@st.cache_data
def performance_series() -> pd.DataFrame:
    rng = np.random.default_rng(42)
    daily_moves = rng.normal(0.0025, 0.009, 30)
    values = value * np.cumprod(1 + daily_moves)
    dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=30)
    return pd.DataFrame({"Date": dates, "Portfolio Value": values})

performance = performance_series()
line = px.line(performance, x="Date", y="Portfolio Value", markers=True, template="plotly_dark", color_discrete_sequence=["#47d7ac"])
line.update_traces(line_width=3, marker_size=5)
line.update_layout(yaxis_tickprefix="₹", yaxis_tickformat=",.0f", hovermode="x unified", margin=dict(t=20, b=20, l=10, r=10))
st.plotly_chart(line, use_container_width=True)
