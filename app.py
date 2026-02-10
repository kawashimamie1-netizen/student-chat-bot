import streamlit as st
import google.generativeai as genai

# タイトル
st.title("Gemini Chat App")

# APIキーの設定
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# --- ファイルの読み込み ---
def load_file(filename):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""

# 1. 指示文 (System Instruction) の読み込み
system_instruction = load_file("instructions.txt")

# 2. 資料 (Knowledge) の読み込み
campus_knowledge = load_file("campus_data.txt")
# -------------------------

# モデルの初期化（指示文を設定）
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=system_instruction
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
            # 資料(Knowledge)とユーザーの質問を組み合わせてプロンプトを作成
            # 「以下の資料に基づいて答えてください」という指示を添えるのが一般的です
            combined_prompt = f"""以下の資料（キャンパスデータ）の内容を知識として参照し、ユーザーの質問に答えてください。

【資料】
{campus_knowledge}

---
【ユーザーの質問】
{prompt}"""

            # 生成（履歴を含める場合は chat_session を使いますが、シンプルに資料を添えて回答させる形です）
            response = model.generate_content(combined_prompt)
            
            st.markdown(response.text)
            st.session_state.messages.append({"role": "assistant", "content": response.text})
        except Exception as e:
            st.error(f"エラーが発生しました: {e}")
