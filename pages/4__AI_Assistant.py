import streamlit as st


st.set_page_config(page_title="AI Assistant", page_icon="🤖", layout="wide")
st.markdown("""
<style>
.block-container { max-width: 1100px; padding-top: 2rem; }
.suggestion { display:block; width:100%; text-align:left; margin-bottom:6px; }
</style>
""", unsafe_allow_html=True)

PRESET_QA = [
    {"question": "Why is the TCS news relevant to my portfolio?", "keywords": ["tcs", "news", "relevant"],
     "answer": "You hold 12 shares of TCS. The new AI partnership with Microsoft strengthens TCS's cloud & AI service offerings, which is positive for the IT sector. Since IT is ~25% of your portfolio, this news directly affects your holdings."},
    {"question": "What sectors are in my portfolio?", "keywords": ["sectors", "portfolio"],
     "answer": "Your portfolio spans 4 sectors: Energy (Reliance), Banking (HDFC), Automotive (Tata Motors), and IT (TCS + Infosys). IT has the highest allocation."},
    {"question": "Explain the semiconductor policy news.", "keywords": ["semiconductor", "policy"],
     "answer": "The government's ₹10,000 Cr semiconductor push could benefit electronics and IT companies in your portfolio indirectly, especially TCS and Infosys which serve semiconductor clients."},
    {"question": "What are the major risks in my portfolio?", "keywords": ["risks", "risk"],
     "answer": "1) High IT sector concentration (~40%), 2) Reliance exposure to crude oil volatility, 3) Tata Motors depends on EV policy continuity."},
    {"question": "How is my portfolio performing?", "keywords": ["performing", "performance"],
     "answer": "Your portfolio is up ~14.2% overall. Top gainer: Tata Motors (+25.8%). Only slight lag: HDFC Bank (+8.4%)."},
]

FALLBACK = "I'm a demo assistant with a small set of scripted answers for this first review. Try one of the suggested questions on the left, or ask about TCS, sectors, the semiconductor policy, portfolio risks, or performance."

with st.sidebar:
    st.markdown("## 📊 Portfolio Intelligence")
    st.caption("Page 4 · AI Assistant")
    st.info("Ask a question or pick a suggested prompt.")
    st.caption("Demo data — for academic review only. Not financial advice.")
    st.divider()
    st.markdown("#### Suggested Questions")
    for item in PRESET_QA:
        if st.button(item["question"], key=f"suggest_{item['question'][:20]}", use_container_width=True):
            st.session_state["pending_prompt"] = item["question"]

st.title("🤖 AI Assistant")
st.caption("Ask about the demo portfolio, holdings, sectors, risks, and related news.")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

prompt = st.chat_input("Ask about your portfolio or the news...")
if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    lowered = prompt.lower()
    response = FALLBACK
    for item in PRESET_QA:
        if prompt.strip().lower() == item["question"].lower() or any(keyword in lowered for keyword in item["keywords"]):
            response = item["answer"]
            break
    st.session_state.messages.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)

if "pending_prompt" in st.session_state:
    pending = st.session_state.pop("pending_prompt")
    st.session_state.messages.append({"role": "user", "content": pending})
    with st.chat_message("user"):
        st.markdown(pending)
    response = next((item["answer"] for item in PRESET_QA if item["question"] == pending), FALLBACK)
    st.session_state.messages.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)
