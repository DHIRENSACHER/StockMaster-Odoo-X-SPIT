import React from 'react';

export const GlassCard = ({ 
  children, 
  className = '', 
  onClick 
}: { 
  children?: React.ReactNode; 
  className?: string; 
  onClick?: () => void 
}) => (
  <div onClick={onClick} className={`glass-card rounded-3xl ${className}`}>
    {children}
  </div>
);