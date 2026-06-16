import React from 'react';

interface EraStyleProps {
    children: React.ReactNode;
}

const AncientStyle: React.FC<EraStyleProps> = ({ children }) => (
    <div className="ancient-era-style" style={{
        fontFamily: '"STKaiti", "KaiTi", serif',
        background: 'linear-gradient(180deg, #1a1510 0%, #0d0a07 100%)',
        '--era-accent': '#C41E3A',
        '--era-accent-light': '#C41E3A40',
        '--era-border': '#5C4033',
    } as React.CSSProperties}>
        {children}
    </div>
);

export default AncientStyle;
