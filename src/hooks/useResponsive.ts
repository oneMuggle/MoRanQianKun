// hooks/useResponsive.ts
// 响应式断点检测 — 从 App.tsx 提取

import * as React from 'react';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

export function useResponsive(): { isMobile: boolean } {
    const [isMobile, setIsMobile] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(MOBILE_BREAKPOINT).matches;
    });

    React.useEffect(() => {
        const mq = window.matchMedia(MOBILE_BREAKPOINT);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    return { isMobile };
}
