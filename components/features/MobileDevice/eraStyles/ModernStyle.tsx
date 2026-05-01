import React from 'react';

interface EraStyleProps {
    children: React.ReactNode;
}

const ModernStyle: React.FC<EraStyleProps> = ({ children }) => (
    <div className="modern-era-style" style={{
        fontFamily: '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        '--era-accent': '#4FC3F7',
        '--era-accent-light': '#4FC3F740',
        '--era-border': '#2196F366',
    } as React.CSSProperties}>
        {children}
    </div>
);

export default ModernStyle;
