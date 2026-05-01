import React from 'react';

interface EraStyleProps {
    children: React.ReactNode;
}

const RetroStyle: React.FC<EraStyleProps> = ({ children }) => (
    <div className="retro-era-style" style={{
        fontFamily: '"Courier New", "Consolas", monospace',
        background: 'linear-gradient(180deg, #2C1810 0%, #1A0F0A 100%)',
        '--era-accent': '#B87333',
        '--era-accent-light': '#B8733340',
        '--era-border': '#8B6914',
    } as React.CSSProperties}>
        {children}
    </div>
);

export default RetroStyle;
