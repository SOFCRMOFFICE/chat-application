'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: Date;
}

interface Product {
  id: string;
  title: string;
  price: string;
  url: string;
  image?: string;
  description: string;
  category: string;
}

interface ChatBotProps {
  apiUrl?: string;
  appName?: string;
  brand?: {
    logo?: string;
    color?: string;
    name?: string;
  };
}

export const ChatBot: React.FC<ChatBotProps> = ({
  apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api',
  appName = 'MTG.in Assistant',
  brand = {
    logo: undefined,
    color: '#1f2937',
    name: 'MTG.in',
  },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant message with products
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        products: data.products || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `👋 Welcome to ${appName}! I can help you find products, answer questions about our offerings, and provide information about pricing and availability. What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full p-4 text-white shadow-lg hover:scale-110 transition-transform"
          style={{ backgroundColor: brand?.color || '#1f2937' }}
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col w-96 h-[600px] rounded-lg shadow-2xl bg-white border border-gray-200">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-t-lg text-white"
            style={{ backgroundColor: brand?.color || '#1f2937' }}
          >
            <div className="flex items-center gap-2">
              {brand?.logo && (
                <img src={brand.logo} alt={brand.name} className="w-6 h-6" />
              )}
              <h2 className="font-semibold">{appName}</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Message Bubble */}
                <div
                  className={`flex ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-3 flex gap-2 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: brand?.color || '#1f2937',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
              aria-label="Send message"
            >
              <Send size={18} className="text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-300 rounded-lg p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
            {product.title}
          </h4>
          <p className="text-sm text-blue-600 font-bold mt-1">{product.price}</p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
            {product.category}
          </p>
        </div>
      </div>
    </a>
  );
}

export default ChatBot;
