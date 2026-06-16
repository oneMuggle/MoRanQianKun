import React from 'react';

interface EraStyleProps {
    children: React.ReactNode;
}

const HolographicStyle: React.FC<EraStyleProps> = ({ children }) => (
    <div className="holographic-era-style" style={{
        fontFamily: '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 50%, #0D1B2A 100%)',
        '--era-accent': '#E0B0FF',
        '--era-accent-light': '#E0B0FF40',
        '--era-border': '#E0B0FF33',
    } as React.CSSProperties}>
        {children}
    </div>
);

export default HolographicStyle;
