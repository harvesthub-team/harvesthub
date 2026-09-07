// src/components/TypingAnimation.jsx
import { useState, useEffect } from 'react';
import './TypingAnimation.css';

export default function TypingAnimation({ 
  text, 
  speed = 80, 
  delay = 500,
  onComplete 
}) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    let timeoutId;

    // Initial delay before typing starts
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      
      const typeNextChar = () => {
        if (index < text.length) {
          setDisplayText(text.substring(0, index + 1));
          index++;
          timeoutId = setTimeout(typeNextChar, speed);
        } else {
          setIsTyping(false);
          if (onComplete) onComplete();
        }
      };

      typeNextChar();
    }, delay);

    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className="typing-container">
      <span className="typing-text">{displayText}</span>
      <span className={`typing-cursor ${!isTyping ? 'typing-cursor--done' : ''} ${showCursor ? '' : 'hidden'}`}>
        |
      </span>
    </span>
  );
}