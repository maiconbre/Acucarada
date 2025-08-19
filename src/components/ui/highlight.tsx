import React from 'react';

interface HighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

/**
 * Componente para destacar termos de busca no texto
 */
export function Highlight({ text, searchTerm, className = '' }: HighlightProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Split search term into individual words and escape special regex characters
  const searchWords = searchTerm.trim().split(/\s+/).map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  // Create regex for case-insensitive search of any word
  const regex = new RegExp(`(${searchWords.join('|')})`, 'gi');
  
  // Split text by search terms
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any search term (case-insensitive)
        const isMatch = part && searchWords.some(word => 
          new RegExp(`^${word}$`, 'i').test(part)
        );
        
        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}