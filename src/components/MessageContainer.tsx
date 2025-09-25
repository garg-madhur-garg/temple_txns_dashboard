import React from 'react';
import { Message } from '../types';
import styles from './MessageContainer.module.css';

interface MessageContainerProps {
  messages: Message[];
  onRemove: (id: string) => void;
}

export const MessageContainer: React.FC<MessageContainerProps> = ({ messages, onRemove }) => {
  if (messages.length === 0) return null;

  return (
    <div className={styles.messageContainer} role="alert" aria-live="polite">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`${styles.message} ${styles[message.type]}`}
          role="alert"
        >
          <span className={styles.messageText}>{message.text}</span>
          <button 
            className={styles.messageClose}
            onClick={() => onRemove(message.id)}
            aria-label={`Close ${message.type} message`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
