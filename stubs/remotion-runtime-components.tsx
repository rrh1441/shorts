import React from 'react';

export const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}> = ({ title, subtitle, align = 'left' }) => {
  const textAlign = align as React.CSSProperties['textAlign'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#111827', lineHeight: 1.05 }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 40, fontWeight: 500, color: '#374151', lineHeight: 1.25 }}>{subtitle}</div>
      )}
    </div>
  );
};

export default { TitleCard };

