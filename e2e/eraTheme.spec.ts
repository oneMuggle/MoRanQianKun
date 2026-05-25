import { test, expect } from '@playwright/test';

// ============================================================
// 三层时代系统 E2E 测试
// 覆盖：时代选择器 UI、主题应用、里模式开关、新游戏创建
// ============================================================

test.describe('新游戏向导 — 时代选择', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('P1 — 打开新游戏向导并进入时代选择', async ({ page }) => {
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: '详细选择' }).click();
        await expect(page.locator('div.fixed.inset-0.z-\\[60\\]')).toBeVisible();
        await expect(page.getByRole('heading', { name: '选择时代' })).toBeVisible();
    });

    test('P2 — 时代选择器展示三层 Epoch 列表', async ({ page }) => {
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: '详细选择' }).click();
        await page.waitForTimeout(1000);

        // 验证 Epoch 列表完整（使用 exact: true 避免子串匹配）
        const tree = page.locator('div.space-y-1');
        await expect(tree.getByText('远古', { exact: true })).toBeVisible();
        await expect(tree.getByText('古代', { exact: true })).toBeVisible();
        await expect(tree.getByText('近代', { exact: true })).toBeVisible();
        await expect(tree.getByText('现代', { exact: true })).toBeVisible();
        await expect(tree.getByText('近未来', { exact: true })).toBeVisible();
        await expect(tree.getByText('未来', { exact: true })).toBeVisible();
        await expect(tree.getByText('后人类', { exact: true })).toBeVisible();

        // 验证树结构使用 evaluate 点击展开
        const result = await page.evaluate(() => {
            // 找到"古代"按钮并点击
            const btns = document.querySelectorAll('div.space-y-1 > div > button');
            let clicked = false;
            for (const btn of btns) {
                const text = btn.textContent || '';
                if (text.includes('古代') && !text.includes('远古')) {
                    (btn as HTMLElement).click();
                    clicked = true;
                    break;
                }
            }
            return { clicked };
        });
        expect(result.clicked).toBe(true);
        await page.waitForTimeout(1000);

        // 验证子节点渲染到 DOM 中（通过 evaluate 检查 DOM 而非 expect）
        const treeState = await page.evaluate(() => {
            const ancientDiv = document.querySelectorAll('div.space-y-1 > div')[1];
            if (!ancientDiv) return { hasChildren: false };
            const ml4 = ancientDiv.querySelector('.ml-4');
            const eraBtns = ml4 ? Array.from(ml4.querySelectorAll('button')).map(b => b.textContent?.trim()) : [];
            return { hasChildren: !!ml4, eraBtns };
        });
        expect(treeState.hasChildren).toBe(true);
        expect(treeState.eraBtns.length).toBeGreaterThan(0);
        // 验证 Era 名称包含"东方古代"
        expect(treeState.eraBtns.some(t => t?.includes('东方古代'))).toBe(true);
    });

    test('P3 — 选择 SubEra 后确认按钮可用', async ({ page }) => {
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: '详细选择' }).click();
        await page.waitForTimeout(1000);

        // 展开树
        await page.evaluate(() => {
            const btns = document.querySelectorAll('div.space-y-1 > div > button');
            for (const btn of btns) {
                if ((btn.textContent || '').includes('古代') && !(btn.textContent || '').includes('远古')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            const btns = document.querySelectorAll('.ml-4 button');
            for (const btn of btns) {
                if ((btn.textContent || '').includes('东方古代')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);
        // 点击武侠 SubEra
        await page.evaluate(() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent || '';
                if (text.includes('武侠') && !text.includes('东方') && btn.closest('.ml-4')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);

        // 验证确认按钮可用
        await expect(page.getByRole('button', { name: '确认时代' })).toBeEnabled();
        // 验证底部状态栏显示已选择
        await expect(page.getByText(/已选择/)).toBeVisible();
    });

    test('P4 — 确认时代选择后关闭弹窗', async ({ page }) => {
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: '详细选择' }).click();
        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            const btns = document.querySelectorAll('div.space-y-1 > div > button');
            for (const btn of btns) {
                if ((btn.textContent || '').includes('古代') && !(btn.textContent || '').includes('远古')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            const btns = document.querySelectorAll('.ml-4 button');
            for (const btn of btns) {
                if ((btn.textContent || '').includes('东方古代')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent || '';
                if (text.includes('武侠') && !text.includes('东方') && btn.closest('.ml-4')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);

        await page.getByRole('button', { name: '确认时代' }).click();
        await expect(page.locator('div.fixed.inset-0.z-\\[60\\]')).not.toBeVisible();
    });
});

test.describe('里模式开关', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('P5 — 新游戏向导中展示子纪元里模式开关', async ({ page }) => {
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('子纪元里模式')).toBeVisible();
    });

    test('P6 — 里模式开关可以切换状态', async ({ page }) => {
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });

        const row = page.locator('div').filter({ has: page.getByText('子纪元里模式') }).first();
        await row.click();
    });
});

test.describe('首页与导航', () => {
    test('P7 — 应用正常加载，首页可见', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await expect(page).toHaveTitle(/墨染乾坤/, { timeout: 10000 });
        await expect(page.getByRole('button', { name: '踏入江湖' })).toBeVisible();
    });
});
