import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import Latex from 'react-latex-next';
import { cn } from '../lib/utils';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! Need help understanding any of the steps or the final answer?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `I'm an AI tutor. You asked: "${userMessage.text}". That's a great question! However, this is just a demo interface.`
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 p-4 rounded-full bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 z-50",
          isOpen && "rotate-90 scale-0 opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare size={24} className="fill-current" />
      </button>

      {/* Chat Window */}
      <div 
        className={cn(
          "fixed bottom-6 right-6 w-[350px] h-[500px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 pointer-events-none translate-y-10"
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-200">Cha</h3>
              <p className="text-xs text-cyan-400">Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-neutral-800">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-start gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-indigo-500/20 text-indigo-400" : "bg-cyan-500/20 text-cyan-400"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              {/* Bubble */}
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-neutral-800 text-neutral-300 rounded-tl-none border border-neutral-700/50"
              )}>
                <Latex>{msg.text}</Latex>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-4 bg-neutral-950 border-t border-neutral-800">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask about a step..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:hover:text-cyan-400 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};