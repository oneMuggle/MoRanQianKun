import { describe, it, expect } from 'vitest';
import { 获取UI文案, 设置时代UI文案, 订阅UI文案变更 } from '../../utils/eraUIText';
import type { 时代主题方案 } from '../../models/eraTheme';

const mockScheme: 时代主题方案 = {
    id: 'test_scheme',
    名称: '测试方案',
    描述: '用于测试的方案',
    配色: {
        'ink-black': '#000', 'ink-gray': '#333', primary: '#fff',
        'primary-dark': '#ccc', secondary: '#999', accent: '#f00', 'paper-white': '#fff',
    },
    字体: { 页面标题: 'serif', 正文: 'sans-serif', 等宽: 'monospace' },
    界面文案: { 设置面板标题: '测试标题', 发送按钮: '测试发送' },
};

describe('获取UI文案', () => {
    it('返回默认文案', () => {
        const text = 获取UI文案();
        expect(text['设置面板标题']).toBe('江湖设定');
        expect(text['发送按钮']).toBe('发送');
    });

    it('返回的是副本而非原始对象', () => {
        const a = 获取UI文案();
        const b = 获取UI文案();
        expect(a).not.toBe(b);
    });
});

describe('设置时代UI文案', () => {
    it('调用后获取到合并后的文案', () => {
        设置时代UI文案(mockScheme);
        const text = 获取UI文案();
        expect(text['设置面板标题']).toBe('测试标题');
        expect(text['发送按钮']).toBe('测试发送');
        expect(text['精力标签']).toBe('精力');
    });
});

describe('订阅UI文案变更', () => {
    it('注册回调后，设置时代UI文案时回调被触发', () => {
        let notified = false;
        let notifiedData: any = null;
        const unsubscribe = 订阅UI文案变更((data) => {
            notified = true;
            notifiedData = data;
        });

        设置时代UI文案(mockScheme);

        expect(notified).toBe(true);
        expect(notifiedData).not.toBeNull();
        expect(notifiedData['设置面板标题']).toBe('测试标题');

        unsubscribe();
    });

    it('取消订阅后回调不再被触发', () => {
        let count = 0;
        const unsubscribe = 订阅UI文案变更(() => { count++; });

        设置时代UI文案(mockScheme);
        expect(count).toBe(1);

        unsubscribe();
        设置时代UI文案(mockScheme);
        expect(count).toBe(1);
    });

    it('多个回调都会被触发', () => {
        let count1 = 0;
        let count2 = 0;
        const unsub1 = 订阅UI文案变更(() => { count1++; });
        const unsub2 = 订阅UI文案变更(() => { count2++; });

        设置时代UI文案(mockScheme);
        expect(count1).toBe(1);
        expect(count2).toBe(1);

        unsub1();
        unsub2();
    });
});
