
import React, { useState, useEffect, useRef } from 'react';
import { Assignment, ChatMessage } from '../types';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { startTutorChat } from '../services/geminiService';
import MathRenderer from './MathRenderer';

interface TutorChatProps {
  assignment: Assignment;
}

const TutorChat: React.FC<TutorChatProps> = ({ assignment }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const systemInstruction = `You are "Kala Mentor", a high-level senior professor assisting with "${assignment.title}". Use a supportive, intellectual, and precise academic tone. Encourage critical thinking. Your output should feel like an academic journal entry. Use rich vocabulary but remain accessible. Focus on bridging the gap between current knowledge and the required outcome: ${assignment.learningOutcome}. If math is involved, use LaTeX ($...$ for inline, $$...$$ for block).`;
    chatRef.current = startTutorChat(systemInstruction);
    setMessages([{
      role: 'model',
      text: `Good day. I have digitized the core requirements for "${assignment.title}". Let us refine your intellectual approach to this task. Where shall we begin our analysis?`,
      timestamp: new Date().toISOString()
    }]);
  }, [assignment.id]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const result = await chatRef.current.sendMessage({ message: input });
      setMessages(prev => [...prev, { role: 'model', text: result.text, timestamp: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[800px] border border-navy-50 dark:border-navy-900 rounded-[4rem] overflow-hidden bg-white dark:bg-navy-950 transition-all font-sans shadow-xl">
      <header className="px-10 py-6 border-b border-navy-50 dark:border-navy-900 bg-navy-50/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-navy-900 dark:bg-white text-white dark:text-navy-900 rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20} /></div>
          <div className="space-y-0.5">
            <span className="academic-label block">Contextual Mentor</span>
            <h4 className="text-sm font-black uppercase tracking-tight">Academic Inquiry Node</h4>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-8 animate-in fade-in duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border shadow-xl transition-all ${msg.role === 'model' ? 'bg-navy-900 dark:bg-white text-white dark:text-navy-900 border-transparent rotate-3' : 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white border-navy-100 dark:border-navy-700 -rotate-3'}`}>
              {msg.role === 'model' ? <Bot size={22} /> : <User size={22} />}
            </div>
            <div className={`space-y-4 pt-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className="academic-label !opacity-100 text-navy-900 dark:text-white">{msg.role === 'model' ? 'Kala Mentor' : 'Primary User'}</span>
                <span className="text-[9px] text-navy-200 font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`text-xl leading-relaxed transition-all ${msg.role === 'model' ? 'mentor-text italic text-navy-700 dark:text-navy-100' : 'font-medium text-navy-400 dark:text-navy-500'}`}>
                <MathRenderer content={msg.text} />
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-8 opacity-40">
            <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-navy-900 text-white shadow-xl rotate-3">
              <Bot size={22} />
            </div>
            <div className="pt-4">
              <Loader2 size={24} className="animate-spin text-navy-900 dark:text-white" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-10 bg-navy-50/30 dark:bg-navy-900/30 border-t border-navy-50 dark:border-navy-900 backdrop-blur-xl">
        <div className="flex items-center gap-6 bg-white dark:bg-navy-950 border border-navy-100 dark:border-navy-800 rounded-[2.5rem] px-10 py-6 focus-within:ring-4 focus-within:ring-navy-900/5 transition-all shadow-inner group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Engage in academic analysis..."
            dir={/[\u0600-\u06FF]/.test(input) ? "rtl" : "ltr"}
            className={`flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder-navy-200 dark:text-white ${/[\u0600-\u06FF]/.test(input) ? 'font-arabic' : ''}`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-navy-900 dark:bg-white text-white dark:text-navy-900 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-110 active:scale-90 shadow-2xl"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <span className="academic-label !text-[8px] opacity-20">Secure Academic Socket Active</span>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;
