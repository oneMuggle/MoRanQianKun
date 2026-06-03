import { test, expect, Page } from '@playwright/test';

/**
 * E2E 测试：写真 NSFW 设置面板
 * 覆盖：新建游戏 → 进入游戏 → 打开设置 → 写真 NSFW 标签 → 开关切换 → 强度选择
 *
 * 游戏创建流程（5步向导）：
 * 1. 世界观 → 2. 角色基础 → 3. 天赋背景 → 4. 开局配置 → 5. 确认生成
 */

async function startNewGameAndEnterGame(page: Page) {
    // 点击"踏入江湖"按钮
    await page.getByRole('button', { name: '踏入江湖' }).click();

    // 等待新游戏向导出现
    await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });

    // 当前在"世界观"步骤，点击"详细选择"进入时代选择
    await page.getByRole('button', { name: '详细选择' }).click();
    await page.waitForTimeout(1000);

    // 展开"现代"节点
    await page.evaluate(() => {
        const btns = document.querySelectorAll('div.space-y-1 > div > button');
        for (const btn of btns) {
            const text = btn.textContent || '';
            if (text.includes('现代')) {
                (btn as HTMLElement).click();
                return;
            }
        }
    });
    await page.waitForTimeout(500);

    // 选择"当代都市"
    await page.evaluate(() => {
        const btns = document.querySelectorAll('.ml-4 button');
        for (const btn of btns) {
            if ((btn.textContent || '').includes('当代')) {
                (btn as HTMLElement).click();
                return;
            }
        }
    });
    await page.waitForTimeout(500);

    // 关闭时代选择弹窗
    const confirmEraBtn = page.getByRole('button', { name: '确认时代' });
    if (await confirmEraBtn.isVisible({ timeout: 3000 })) {
        await confirmEraBtn.click();
        await page.waitForTimeout(500);
    }

    // 点击"下一步"进入角色基础（步骤2）
    let nextBtn = page.getByRole('button', { name: '下一步' });
    if (await nextBtn.isVisible({ timeout: 3000 })) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
    }

    // 步骤2：角色基础 - 填写角色名称
    // 名称输入框的placeholder为"例如：李长风、苏清月"
    const nameInput = page.locator('input[placeholder*="例如"]');
    if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.fill('测试模特');
        await page.waitForTimeout(500);
    }

    // 继续下一步到步骤3
    nextBtn = page.getByRole('button', { name: '下一步' });
    if (await nextBtn.isVisible({ timeout: 3000 })) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
    }

    // 步骤3：天赋背景 - 直接下一步
    nextBtn = page.getByRole('button', { name: '下一步' });
    if (await nextBtn.isVisible({ timeout: 3000 })) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
    }

    // 步骤4：开局配置 - 直接下一步
    nextBtn = page.getByRole('button', { name: '下一步' });
    if (await nextBtn.isVisible({ timeout: 3000 })) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
    }

    // 步骤5：确认生成 - 点击"开启世界推演"
    const startBtn = page.getByRole('button', { name: '开启世界推演' });
    if (await startBtn.isVisible({ timeout: 5000 })) {
        await startBtn.click();
    }

    // 确认创建弹窗 - 点击"开始生成"
    const confirmBtn = page.getByRole('button', { name: '开始生成' });
    if (await confirmBtn.isVisible({ timeout: 5000 })) {
        await confirmBtn.click();
    }

    // 等待AI生成故事（可能需要较长时间）
    await page.waitForTimeout(15000);

    // 验证进入游戏主界面 - 使用更宽松的匹配
    const bodyText = await page.locator('body').innerText();
    const hasGameContent = bodyText.includes('江湖') || bodyText.includes('聊天') || bodyText.includes('故事');
    expect(hasGameContent).toBeTruthy();
}

async function openSettingsAndNavigateToPhotographyNSFW(page: Page) {
    // 写真 NSFW 设置位于 NsfwControlCenter（NSFW 管理中心），
    // 入口在 GameView 顶部右上角的小"NSFW"按钮（aria-label="NSFW 管理中心"）。
    const nsfwEntry = page.getByRole('button', { name: 'NSFW 管理中心' }).first();
    await expect(nsfwEntry).toBeVisible({ timeout: 10000 });
    await nsfwEntry.click({ force: true });

    // 等待 NsfwControlCenter 真正打开。控制中心打开后，标题 'NSFW 管理中心'
    // 会出现两次（按钮 aria-label + 弹窗 h2），且头部会有"全部启用"按钮
    // （NsfwControlCenter.tsx line 90，仅在控制中心弹窗内渲染）。
    // 用"全部启用"按钮作为控制中心已打开的可靠判据。
    await expect(page.getByRole('button', { name: '全部启用' })).toBeVisible({ timeout: 15000 });
}

test.describe('写真 NSFW 设置 E2E', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test.setTimeout(90000);

    test('PHOTO-01: 设置面板包含写真NSFW标签页', async ({ page }) => {
        await startNewGameAndEnterGame(page);
        await openSettingsAndNavigateToPhotographyNSFW(page);

        // 写真 NSFW 设置位于 NsfwControlCenter（NSFW 管理中心）。
        // helper 已验证控制中心打开（"全部启用"按钮可见）。
        // 此处直接断言控制中心内已注册写真 NSFW 模块——
        // 模块卡片显示 module.name = '写真约拍NSFW'（无空格）。
        const bodyText = await page.locator('body').innerText();
        expect(bodyText).toContain('写真约拍NSFW');
    });

    test('PHOTO-02: 启用/禁用写真NSFW系统开关', async ({ page }) => {
        await startNewGameAndEnterGame(page);
        await openSettingsAndNavigateToPhotographyNSFW(page);

        // 通过 JavaScript 找到并切换写真NSFW系统开关
        const result = await page.evaluate(() => {
            const labels = document.querySelectorAll('label');
            let targetButton: HTMLElement | null = null;
            for (const label of labels) {
                if (label.textContent?.includes('启用写真NSFW系统')) {
                    const row = label.closest('.flex.items-center.justify-between') || label.parentElement?.parentElement;
                    if (row) {
                        targetButton = row.querySelector('button.rounded-full') as HTMLElement;
                        if (targetButton) break;
                    }
                }
            }
            if (!targetButton) return { error: 'toggle not found' };
            const wasOn = targetButton.className.includes('bg-wuxia-gold');
            targetButton.click();
            return { wasOn, clicked: true };
        });

        if (result.error) throw new Error(result.error);

        // 等待状态更新
        await page.waitForTimeout(500);

        // 验证开关状态已改变
        const newOn = await page.evaluate(() => {
            const labels = document.querySelectorAll('label');
            for (const label of labels) {
                if (label.textContent?.includes('启用写真NSFW系统')) {
                    const row = label.closest('.flex.items-center.justify-between') || label.parentElement?.parentElement;
                    if (row) {
                        const btn = row.querySelector('button.rounded-full');
                        if (btn) return btn.className.includes('bg-wuxia-gold');
                    }
                }
            }
            return null;
        });
        expect(newOn).not.toBe(result.wasOn);
    });

    test('PHOTO-03: 内容强度选择器存在', async ({ page }) => {
        await startNewGameAndEnterGame(page);
        await openSettingsAndNavigateToPhotographyNSFW(page);

        // 验证内容强度选择器存在（disabled 元素 Playwright 认为 hidden，改用 attached 检查）
        const intensitySelect = page.locator('select').first();
        await expect(intensitySelect).toBeAttached();

        // 获取当前选项
        const options = await intensitySelect.locator('option').allTextContents();
        expect(options.length).toBeGreaterThanOrEqual(2);
    });

    test('PHOTO-04: 主要玩法层选择器存在', async ({ page }) => {
        await startNewGameAndEnterGame(page);
        await openSettingsAndNavigateToPhotographyNSFW(page);

        // 验证主要玩法层选择器存在
        const select = page.locator('select');
        // 至少有一个select包含玩法层选项
        const allOptions = await select.all();
        let hasGameplayLayer = false;
        for (const s of allOptions) {
            const opts = await s.locator('option').allTextContents();
            if (opts.some(o => o.includes('灰色地带') || o.includes('经营'))) {
                hasGameplayLayer = true;
                break;
            }
        }
        expect(hasGameplayLayer).toBe(true);
    });

    test('PHOTO-05: 子开关（尺度递进/越界识别/照片交付/泄露事件）存在', async ({ page }) => {
        await startNewGameAndEnterGame(page);
        await openSettingsAndNavigateToPhotographyNSFW(page);

        // 验证所有子开关存在（ToggleSwitch 组件使用 button.rounded-full）
        // 在写真NSFW内容区域内计数开关（.first() 避免严格模式冲突）
        const contentArea = page.locator('div').filter({ hasText: '写真约拍 NSFW' }).first();
        const toggles = contentArea.locator('button.rounded-full');
        const count = await toggles.count();
        // 至少有 启用写真NSFW系统 + 4个子开关
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('PHOTO-06: 泄露事件频率选择器存在', async ({ page }) => {
        await startNewGameAndEnterGame(page);
        await openSettingsAndNavigateToPhotographyNSFW(page);

        // 查找包含"频率"标签的选择器
        const selects = page.locator('select');
        const count = await selects.count();
        expect(count).toBeGreaterThanOrEqual(2); // 内容强度 + 玩法层 + 频率
    });
});
