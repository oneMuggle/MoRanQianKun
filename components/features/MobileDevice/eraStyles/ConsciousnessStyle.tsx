import React from 'react';

interface EraStyleProps {
    children: React.ReactNode;
}

const ConsciousnessStyle: React.FC<EraStyleProps> = ({ children }) => (
    <div className="consciousness-era-style" style={{
        fontFamily: '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
        '--era-accent': '#333333',
        '--era-accent-light': '#33333320',
        '--era-border': '#CCCCCC66',
    } as React.CSSProperties}>
        {children}
    </div>
);

export default ConsciousnessStyle;
