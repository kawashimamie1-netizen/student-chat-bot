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
            combined_prompt = f"""以下の資料（キャンパスデータ）の内容を知識として参照し、ユーザーの質問に答えてください

# --- 修正箇所：AIの回答生成部分 ---
with st.chat_message("assistant"):
    try:
        # 1. 役割と資料を明確に区切る構造化プロンプト
        structured_prompt = f"""
# 厳守事項
必ず以下の資料の内容のみを使用して回答してください。資料にないことは「不明」と答えてください

# 資料
{campus_knowledge}

# ユーザーの質問
{prompt}
"""
        # 2. 生成時に「温度（Temperature）」を低く設定して、勝手な推測を抑える
        # model.generate_content の引数に generation_config を追加
        response = model.generate_content(
            structured_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,  # 0に近いほど、資料に忠実になります
            )
        )
        
        st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})


