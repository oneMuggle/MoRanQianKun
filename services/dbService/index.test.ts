/**
 * services/dbService/index.test.ts
 *
 * Day 50：dbService 顶层入口测试
 * 覆盖：清空/清除/获取存储信息（高层组合 API）
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    清空全部设置,
    清除自定义背景与天赋,
    清除图库相关内容,
    清除图片相关提示词与预设,
    清除系统缓存,
    获取详细存储信息,
    清空全部数据,
    强制彻底清空全部数据,
    清空数据库,
} from './index';
import { 保存设置, 读取设置, 设置存档保护状态 } from './stores';
import { 初始化数据库 } from './initialization';
import { SETTINGS_STORE, IMAGE_ASSETS_STORE, STORE_NAME, DEVICE_MESSAGES_STORE } from './schema';
import { 设置键 } from '../../utils/settingsSchema';

const 清空全部 = async () => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(
            [SETTINGS_STORE, IMAGE_ASSETS_STORE, STORE_NAME, DEVICE_MESSAGES_STORE],
            'readwrite'
        );
        tx.objectStore(SETTINGS_STORE).clear();
        tx.objectStore(IMAGE_ASSETS_STORE).clear();
        tx.objectStore(STORE_NAME).clear();
        tx.objectStore(DEVICE_MESSAGES_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

// jsdom 20+ 下 localStorage 可能存在但缺少 clear（opaque origins）
// 强制 stub 一个最小 Storage polyfill
const stubStorage = () => {
    const store: Record<string, string> = {};
    return {
        clear: () => { for (const k of Object.keys(store)) delete store[k]; },
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
        key: (i: number) => Object.keys(store)[i] ?? null,
        get length() { return Object.keys(store).length; },
    };
};
const storage = stubStorage();
try {
    Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true, configurable: true });
} catch {
    (globalThis as any).localStorage = storage;
}

describe('清空全部设置', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空全部();
    });

    it('清空全部设置', async () => {
        await 保存设置('regular-key', 'value');
        await 保存设置(设置键.存档保护, true);
        await 清空全部设置();

        expect(await 读取设置('regular-key')).toBeNull();
        // 存档保护开启时不会被清空
        expect(await 读取设置(设置键.存档保护)).toBe(true);
    });

    it('保留APIKey 选项', async () => {
        await 保存设置('regular-key', 'value');
        await 保存设置(设置键.API配置, { activeConfigId: 'keep-me' });
        await 清空全部设置({ 保留APIKey: true });

        expect(await 读取设置('regular-key')).toBeNull();
        expect(await 读取设置(设置键.API配置)).toBeDefined();
    });
});

describe('清除自定义背景与天赋', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空全部();
    });

    it('清除自定义背景、天赋、开局预设', async () => {
        await 保存设置(设置键.自定义天赋, { talent: 'x' });
        await 保存设置(设置键.自定义背景, { background: 'y' });
        await 保存设置(设置键.自定义开局预设, { preset: 'z' });

        await 清除自定义背景与天赋();

        expect(await 读取设置(设置键.自定义天赋)).toBeNull();
        expect(await 读取设置(设置键.自定义背景)).toBeNull();
        expect(await 读取设置(设置键.自定义开局预设)).toBeNull();
    });

    it('视觉设置存在时被修改', async () => {
        await 保存设置(设置键.视觉设置, { 背景图片: 'https://example.com/bg.png' });
        await 清除自定义背景与天赋();
        const visual = await 读取设置(设置键.视觉设置);
        expect((visual as any).背景图片).toBe('');
    });
});

describe('清除图库相关内容', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空全部();
    });

    it('清除存档中的图库字段', async () => {
        const dataUrl = 'data:image/png;base64,QQ==';
        const db = await 初始化数据库();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            tx.objectStore(STORE_NAME).put({
                类型: 'manual',
                时间戳: Date.now(),
                角色数据: { 姓名: 'x' },
                环境信息: {},
                历史记录: [],
                场景图片档案: { scene1: dataUrl },
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        await 清除图库相关内容();
        const list = await new Promise<any[]>((resolve, reject) => {
            const tx = db.transaction([STORE_NAME], 'readonly');
            const req = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        expect(list[0].场景图片档案).toBeUndefined();
    });
});

describe('清除系统缓存', () => {
    it('执行不抛错', async () => {
        await expect(清除系统缓存()).resolves.not.toThrow();
    });
});

describe('获取详细存储信息', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空全部();
    });

    it('返回结构化 breakdown', async () => {
        await 保存设置(设置键.游戏设置, { foo: 'bar' });
        const info = await 获取详细存储信息();
        expect(info).toHaveProperty('usage');
        expect(info).toHaveProperty('quota');
        expect(info.details).toHaveProperty('saves');
        expect(info.details).toHaveProperty('settings');
        expect(info.details).toHaveProperty('prompts');
        expect(info.details).toHaveProperty('api');
        expect(info.details).toHaveProperty('imageAssets');
        expect(info.details).toHaveProperty('cache');
    });

    it('usage 字段为 number', async () => {
        const info = await 获取详细存储信息();
        expect(typeof info.usage).toBe('number');
        expect(typeof info.quota).toBe('number');
    });
});

describe('清空全部数据 / 强制彻底清空 / 清空数据库', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空全部();
    });

    it('清空全部数据清空 settings', async () => {
        await 保存设置('k', 'v');
        await 清空全部数据();
        expect(await 读取设置('k')).toBeNull();
    });

    it('强制彻底清空全部数据清空所有 store', async () => {
        await 保存设置('k', 'v');
        await 强制彻底清空全部数据();
        expect(await 读取设置('k')).toBeNull();
    });

    it('清空数据库作为清空全部数据的快捷方式', async () => {
        await 保存设置('shortcut-key', 'v');
        await 清空数据库(false);
        expect(await 读取设置('shortcut-key')).toBeNull();
    });

    it('清除图片相关提示词与预设 不抛错', async () => {
        await 保存设置(设置键.API配置, { activeConfigId: 'cfg' });
        await 清除图片相关提示词与预设();
        const api = await 读取设置(设置键.API配置);
        expect(api).toBeDefined();
    });
});
