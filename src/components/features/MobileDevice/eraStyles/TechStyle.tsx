import React from 'react';

interface EraStyleProps {
    children: React.ReactNode;
}

const TechStyle: React.FC<EraStyleProps> = ({ children }) => (
    <div className="tech-era-style" style={{
        fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
        background: 'linear-gradient(180deg, #0A0E27 0%, #050810 100%)',
        '--era-accent': '#00FF88',
        '--era-accent-light': '#00FF8840',
        '--era-border': '#00FF8833',
    } as React.CSSProperties}>
        {children}
    </div>
);

export default TechStyle;
