
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, MessageRole } from './types';
import { CAMPUS_DATA, SYSTEM_INSTRUCTION } from './constants';
import { Search, Send, User, Bot, HelpCircle, MapPin, Info, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'こんにちは。こちらは大学の受付窓口でございます。キャンパス内の施設案内や場所についてお気軽にお尋ねください。',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || '申し訳ございません。応答の生成中にエラーが発生しました。',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: '申し訳ございません。通信環境等の理由によりお答えすることができません。しばらく経ってから再度お試しください。',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBuildings = CAMPUS_DATA.filter(b => 
    b.name.includes(searchQuery) || 
    b.details.some(d => d.includes(searchQuery))
  );

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Info className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">大学受付窓口</h1>
            <p className="text-xs text-slate-500 mt-1">Campus Information Concierge</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1"><HelpCircle size={16} /> ヘルプ</span>
          <span className="flex items-center gap-1"><MapPin size={16} /> キャンパス内</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-4 p-4">
        {/* Left Side: Directory (Quick Search) */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 order-2 md:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[400px] md:h-full">
            <div className="p-4 border-b">
              <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Search size={18} /> 施設クイック検索
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="施設名やキーワード..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {filteredBuildings.length > 0 ? (
                <div className="space-y-3">
                  {filteredBuildings.map(building => (
                    <div 
                      key={building.id} 
                      className="p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => setInput(`「${building.name}」について教えてください`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 text-sm">{building.name}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        {building.details.map((detail, idx) => (
                          <div key={idx}>{detail}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-10">
                  <p className="text-sm">該当する施設が見つかりません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Concierge */}
        <div className="w-full md:w-2/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden order-1 md:order-2">
          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-slate-200 text-slate-600 animate-pulse">
                  <Bot size={20} />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="場所や窓口について質問してください..."
                className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
              >
                <Send size={20} />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              ※公式資料に基づいた情報のみを提供いたします。
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-slate-800 text-white p-3 rounded-full shadow-xl opacity-80"
        >
          <Info size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
