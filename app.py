import streamlit as st
import google.generativeai as genai

# タイトル
st.title("Gemini Chat App")

# APIキーの設定
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# --- ファイル読み込み関数 ---
def load_file(filename):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        st.error(f"エラー: {filename} が見つかりません。")
        return ""

# 1. 指示文 (System Instruction) の読み込み
system_instruction = load_file("instructions.txt")

# 2. 資料 (Knowledge) の読み込み
campus_knowledge = load_file("campus_data.txt")

# モデルの初期化
# instructions.txt の内容をシステム命令として固定
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
    # ユーザーの入力を履歴に追加・表示
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # AIの回答生成
    with st.chat_message("assistant"):
        try:
            # 資料と質問を明確に区切った構造化プロンプト
            # これにより、AIが「どこが資料か」を正確に認識します
            structured_prompt = f"""
# 厳守事項
必ず以下の【資料】の内容のみを使用して回答してください。
資料にない内容を問われた場合は、推測せず正直に「資料に記載がありません」と回答してください。

# 【資料】
{campus_knowledge}

# ユーザーの質問
{prompt}
"""
            # 回答のランダム性を排除し、資料への忠実度を最大化 (temperature=0.0)
            response = model.generate_content(
                structured_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.0,
                )
            )
            
            # 結果の表示と保存
            full_response = response.text
            st.markdown(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})
            
        except Exception as e:
            st.error(f"エラーが発生しました: {e}")
