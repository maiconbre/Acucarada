'use client';

import React from 'react';

interface ErrorButtonProps {
  onRetry?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ErrorButton({ onRetry, children, className }: ErrorButtonProps) {
  const handleClick = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}