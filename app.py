import streamlit as st
import google.generativeai as genai

# タイトル
st.title("Gemini Chat App")

# APIキーの設定
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# --- 追加: instructions.txt の読み込み ---
try:
    with open("instructions.txt", "r", encoding="utf-8") as f:
        system_instruction = f.read()
except FileNotFoundError:
    system_instruction = ""  # ファイルがない場合のデフォルト
# ---------------------------------------

# モデルの初期化（system_instructionを追加）
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=system_instruction  # ここで指示文を渡す
)

# チャット履歴の初期化
if "messages" not in st.session_state:
    st.session_state.messages = []

# 履歴の表示
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# ユーザー入力
if prompt := st.chat_input("メッセージを入力してください"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # AIの回答生成
    with st.chat_message("assistant"):
        try:
            # 履歴も考慮させる場合は model.start_chat を検討すべきですが、
            # 現在のコード（generate_content）を活かす場合は以下になります
            response = model.generate_content(prompt)
            st.markdown(response.text)
            st.session_state.messages.append({"role": "assistant", "content": response.text})
        except Exception as e:
            st.error(f"エラーが発生しました: {e}")
