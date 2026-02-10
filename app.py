import streamlit as st
import google.generativeai as genai

# タイトル
st.title("Gemini Chat App")

# APIキーの設定（Secretsから読み込み）
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# モデルの初期化（ここを「安定版」の名前に固定します）
model = genai.GenerativeModel('gemini-1.5-flash-latest')

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
            response = model.generate_content(prompt)
            st.markdown(response.text)
            st.session_state.messages.append({"role": "assistant", "content": response.text})
        except Exception as e:
            st.error(f"エラーが発生しました: {e}")
