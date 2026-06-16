// 已安装 App 管理 — 安装/卸载状态、分类筛选

import type { AppDefinition } from './appRegistry';
import { allAppDefinitions, getAppsForBackground } from './appRegistry';

export interface InstalledApp {
  appId: string;
  installedAt: number;         // 安装时间戳
  isSystem: boolean;           // 系统 App 不可卸载
  badgeCount?: number;         // 角标数字
  lastOpenedAt?: number;       // 最后打开时间
  nsfwUnlocked?: boolean;      // 是否已解锁 NSFW 内容
  nsfwLevelReached?: number;   // 当前解锁的 NSFW 等级
}

export interface AppInstallState {
  installedApps: InstalledApp[];
}

/** 创建初始已安装 App 列表（通用 + 背景匹配） */
export function createInitialInstallState(
  backgroundName?: string,
  timestamp?: number
): AppInstallState {
  const now = timestamp ?? Date.now();
  const installedApps: InstalledApp[] = [];

  // 所有通用 App
  for (const app of allAppDefinitions) {
    if (app.category === 'universal' || app.isDock) {
      installedApps.push({
        appId: app.id,
        installedAt: now,
        isSystem: true,
      });
    }
  }

  // 背景匹配 App
  if (backgroundName) {
    const matchedApps = getAppsForBackground(backgroundName);
    for (const app of matchedApps) {
      if (!installedApps.some(i => i.appId === app.id)) {
        installedApps.push({
          appId: app.id,
          installedAt: now,
          isSystem: false,
        });
      }
    }
  }

  return { installedApps };
}

/** 安装 App */
export function installApp(
  state: AppInstallState,
  appId: string,
  timestamp?: number
): AppInstallState {
  const existing = state.installedApps.find(i => i.appId === appId);
  if (existing) return state;

  const appDef = allAppDefinitions.find(a => a.id === appId);
  if (!appDef) return state;

  return {
    installedApps: [
      ...state.installedApps,
      {
        appId,
        installedAt: timestamp ?? Date.now(),
        isSystem: appDef.isSystem ?? false,
      },
    ],
  };
}

/** 卸载 App */
export function uninstallApp(
  state: AppInstallState,
  appId: string
): AppInstallState {
  const existing = state.installedApps.find(i => i.appId === appId);
  if (!existing) return state;
  if (existing.isSystem) return state; // 系统 App 不可卸载

  return {
    installedApps: state.installedApps.filter(i => i.appId !== appId),
  };
}

/** 更新角标 */
export function updateBadge(
  state: AppInstallState,
  appId: string,
  count: number
): AppInstallState {
  return {
    installedApps: state.installedApps.map(i =>
      i.appId === appId ? { ...i, badgeCount: count } : i
    ),
  };
}

/** 记录打开时间 */
export function recordAppOpened(
  state: AppInstallState,
  appId: string,
  timestamp?: number
): AppInstallState {
  return {
    installedApps: state.installedApps.map(i =>
      i.appId === appId ? { ...i, lastOpenedAt: timestamp ?? Date.now() } : i
    ),
  };
}

/** 检查是否已安装 */
export function isInstalled(state: AppInstallState, appId: string): boolean {
  return state.installedApps.some(i => i.appId === appId);
}

/** 获取已安装的 App 定义列表 */
export function getInstalledAppDefinitions(
  state: AppInstallState
): AppDefinition[] {
  return state.installedApps
    .map(i => allAppDefinitions.find(a => a.id === i.appId))
    .filter((a): a is AppDefinition => a !== undefined);
}

/** 获取未安装但可用的 App（应用市场中可下载的） */
export function getAvailableApps(
  state: AppInstallState,
  includeNsfw: boolean
): AppDefinition[] {
  return allAppDefinitions.filter(app => {
    if (isInstalled(state, app.id)) return false;
    if (app.category === 'universal') return false; // 通用 App 总是已安装
    if (app.category === 'nsfw' && !includeNsfw) return false;
    return true;
  });
}
