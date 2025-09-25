import { useState, useCallback } from 'react';
import { Message, MessageType } from '../types';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((text: string, type: MessageType = 'info') => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      type
    };
    
    setMessages(prev => [...prev, message]);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
      removeMessage(message.id);
    }, 5000);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    removeMessage,
    clearMessages
  };
};
