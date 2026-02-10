import streamlit as st
import google.generativeai as genai

# タイトル
st.title("Gemini Chat App")

# APIキーの設定（Secretsから読み込み）
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# --- ファイル読み込み関数 ---
def load_file(file_name):
    try:
        with open(file_name, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"{file_name} が見つかりません。"

# 1. 指示（instructions.txt）を読み込む
system_instruction_text = load_file("instructions.txt")

# 2. 資料（campus_data.txt）を読み込む
campus_data = load_file("campus_data.txt")

# 指示と資料を合体させる
full_instruction = f"""
{system_instruction_text}

【資料：Campus Data】
{campus_data}
"""

# モデルの初期化（最新の1.5-flashを指定）
model = genai.GenerativeModel(model_name='models/gemini-2.5-flash')

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


