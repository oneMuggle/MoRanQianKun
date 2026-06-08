/**
 * services/dbService/migrations.test.ts
 *
 * Day 49：版本升级 + 模板导入导出测试
 * 覆盖：图片资源迁移/读取回写保护快照/导出导入研发模板
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    迁移图片资源到独立存储,
    读取设置保护快照,
    回写设置保护快照,
    导出研发设置模板,
    导入研发设置模板,
    自定义背景天赋保护键,
} from './migrations';
import { 保存设置, 读取设置 } from './stores';
import { 初始化数据库 } from './initialization';
import { SETTINGS_STORE, IMAGE_ASSETS_STORE, STORE_NAME } from './schema';
import { 设置键 } from '../../utils/settingsSchema';

const 清空数据 = async () => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(
            [SETTINGS_STORE, IMAGE_ASSETS_STORE, STORE_NAME],
            'readwrite'
        );
        tx.objectStore(SETTINGS_STORE).clear();
        tx.objectStore(IMAGE_ASSETS_STORE).clear();
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

describe('迁移图片资源到独立存储', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('迁移 settings 中的 dataUrl 字段', async () => {
        const db = await 初始化数据库();
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction([SETTINGS_STORE], 'readwrite');
            tx.objectStore(SETTINGS_STORE).put({
                key: 'preset-data',
                value: { 背景图片: dataUrl },
                version: 1,
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        const result = await 迁移图片资源到独立存储();
        expect(result.settings).toBeGreaterThan(0);

        const migrated = await 读取设置('preset-data');
        expect((migrated as any).背景图片).toMatch(/^wuxia-asset:\/\//);

        const flag = await 读取设置(设置键.图片资源迁移版本);
        expect(flag).toBe(true);
    });

    it('迁移 saves 中的 dataUrl 字段', async () => {
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
                本地路径: dataUrl,
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        const result = await 迁移图片资源到独立存储();
        expect(result.saves).toBe(1);
    });

    it('幂等：第二次迁移返回 0', async () => {
        await 迁移图片资源到独立存储();
        const result = await 迁移图片资源到独立存储();
        expect(result.saves).toBe(0);
        expect(result.settings).toBe(0);
    });

    it('空数据库迁移仍写入标记', async () => {
        await 迁移图片资源到独立存储();
        const flag = await 读取设置(设置键.图片资源迁移版本);
        expect(flag).toBe(true);
    });
});

describe('读取设置保护快照 / 回写设置保护快照', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('读取快照返回已存在 key', async () => {
        await 保存设置('keep-1', 'value-1');
        await 保存设置('keep-2', { nested: true });
        const snapshots = await 读取设置保护快照(['keep-1', 'keep-2']);
        expect(snapshots).toHaveLength(2);
        expect(snapshots[0].key).toBe('keep-1');
        expect(snapshots[0].value).toBe('value-1');
    });

    it('跳过不存在的 key', async () => {
        await 保存设置('exists', 'v');
        const snapshots = await 读取设置保护快照(['exists', 'missing']);
        expect(snapshots).toHaveLength(1);
        expect(snapshots[0].key).toBe('exists');
    });

    it('API配置 key 的 value 经过提取可保留配置', async () => {
        await 保存设置(设置键.API配置, { configs: { cfg1: { baseUrl: 'https://x', apiKey: 'k' } } });
        const snapshots = await 读取设置保护快照([设置键.API配置]);
        // 规范化后的对象包含 configs 字段
        expect(snapshots[0].value.configs).toBeDefined();
    });

    it('回写快照恢复设置', async () => {
        await 保存设置('restore-me', 'original');
        const snapshots = await 读取设置保护快照(['restore-me']);

        await 清空数据();
        await 回写设置保护快照(snapshots);

        const restored = await 读取设置('restore-me');
        expect(restored).toBe('original');
    });
});

describe('导出研发设置模板 / 导入研发设置模板', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('导出空配置仍返回有效结构', async () => {
        const template = await 导出研发设置模板();
        expect(template.version).toBe(1);
        expect(template.exportedAt).toBeTruthy();
        expect(template.payload.apiSettings).toBeDefined();
    });

    it('导出包含 API 配置', async () => {
        await 保存设置(设置键.API配置, { configs: { cfg1: { baseUrl: 'https://x', apiKey: 'k' } } });
        const template = await 导出研发设置模板();
        expect((template.payload.apiSettings as any).configs).toBeDefined();
    });

    it('导入模板后 API 配置生效', async () => {
        const template = await 导出研发设置模板();
        const result = await 导入研发设置模板(template);
        expect(result.appliedKeys).toContain(设置键.API配置);
        const applied = await 读取设置(设置键.API配置);
        expect(applied).toBeDefined();
    });

    it('导入 null 抛错', async () => {
        await expect(导入研发设置模板(null)).rejects.toThrow();
    });

    it('导入非对象抛错', async () => {
        await expect(导入研发设置模板('not-object')).rejects.toThrow();
    });

    it('导入缺少 apiSettings 抛错', async () => {
        await expect(导入研发设置模板({ payload: {} })).rejects.toThrow();
    });

    it('导入直接含 apiSettings 字段的简单 payload', async () => {
        await 导入研发设置模板({
            apiSettings: { configs: { cfg1: { baseUrl: 'https://x', apiKey: 'k' } } },
        });
        const applied = await 读取设置(设置键.API配置);
        expect((applied as any).configs).toBeDefined();
    });
});

describe('自定义背景天赋保护键', () => {
    it('包含视觉设置、自定义天赋、自定义背景、自定义开局预设', () => {
        expect(自定义背景天赋保护键).toContain(设置键.视觉设置);
        expect(自定义背景天赋保护键).toContain(设置键.自定义天赋);
        expect(自定义背景天赋保护键).toContain(设置键.自定义背景);
        expect(自定义背景天赋保护键).toContain(设置键.自定义开局预设);
    });
});
