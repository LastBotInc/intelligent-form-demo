"use client";

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeField: {
    id: string;
    label: string;
    instructions: string;
  } | null;
  currentValue: string;
  onSuggestionSelect: (suggestion: string) => void;
}

export default function AIAssistant({
  isOpen,
  onClose,
  activeField,
  currentValue,
  onSuggestionSelect,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeField) {
      setMessages([
        {
          role: 'assistant',
          content: `I'm here to help you with the ${activeField.label} field. ${activeField.instructions}`
        }
      ]);
    }
  }, [activeField]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeField) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          field: activeField,
          currentValue
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let accumulatedMessage = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const content = line.slice(6);
              if (content) {
                accumulatedMessage += content;

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = accumulatedMessage;
                  }
                  return newMessages;
                });
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error generating the response.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-1/2 bg-white shadow-lg transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Assistant
            {isLoading && <span className="ml-2 text-blue-600">Loading...</span>}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'assistant'
                  ? message.content.startsWith('Error:')
                    ? 'bg-red-100 mr-8 text-red-900'
                    : 'bg-blue-200 mr-8 text-gray-900'
                  : 'bg-gray-200 ml-8 text-gray-900'
              }`}
            >
              {message.role === 'assistant' && !message.content.startsWith('Error:') ? (
                <>
                  {message.content.split('SUGGESTION:').map((part, i) => {
                    if (i === 0) {
                      return part.trim() && <p key={i} className="mb-2">{part.trim()}</p>;
                    }
                    const suggestion = part.trim();
                    return suggestion && (
                      <div key={i} className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <p className="font-medium text-sm text-gray-700">Suggested input:</p>
                        </div>
                        <div className="p-3">
                          <p className="text-gray-800 whitespace-pre-wrap">{suggestion}</p>
                          <button
                            onClick={() => onSuggestionSelect(suggestion)}
                            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Use this suggestion
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-md text-gray-900 placeholder-gray-500"
            placeholder={isLoading ? "Please wait..." : "Ask for suggestions..."}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
