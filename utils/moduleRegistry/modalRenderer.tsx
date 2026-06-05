/**
 * 统一弹窗渲染器
 *
 * 从 UIFeatureRegistry 读取所有弹窗配置，按优先级排序渲染。
 * 支持可见性控制（always / era-dependent / config-dependent / hidden）。
 * Phase 7 更新：支持 componentFactory 模式（动态 import 消除静态引用）。
 */

import * as React from 'react';
import { 懒加载边界 } from '../../components/features/lazyComponents';
import { UIFeatureRegistry } from './registry';
import type { ModalConfig, ModalPropsContext } from './types';

interface ModalRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setters: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Record<string, any>;
  isMobile: boolean;
  openModals: Map<string, unknown>;
  onClose: (moduleId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestConfirm?: (options: any) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraProps?: Record<string, any>;
}

/**
 * 从 ModalConfig 获取懒加载组件
 * 支持：desktopComponent/mobileComponent（legacy）或 desktopComponentFactory/mobileComponentFactory（Phase 7）
 */

// 缓存 React.lazy() 结果，避免每次渲染都创建新的 lazy 组件导致闪烁
const _lazyCache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();

function getLazyComponent(modal: ModalConfig, isMobile: boolean, moduleId: string): React.LazyExoticComponent<React.ComponentType<any>> | null {
  const cacheKey = `${moduleId}:${isMobile ? 'm' : 'd'}`;
  if (isMobile && modal.mobileComponentFactory) {
    if (!_lazyCache.has(cacheKey)) {
      _lazyCache.set(cacheKey, React.lazy(modal.mobileComponentFactory));
    }
    return _lazyCache.get(cacheKey)!;
  }
  if (modal.desktopComponentFactory) {
    if (!_lazyCache.has(cacheKey)) {
      _lazyCache.set(cacheKey, React.lazy(modal.desktopComponentFactory));
    }
    return _lazyCache.get(cacheKey)!;
  }
  if (isMobile && modal.mobileComponent) {
    return modal.mobileComponent;
  }
  return modal.desktopComponent || null;
}

export function ModalRenderer({
  state, meta, setters, actions, isMobile, openModals, onClose, requestConfirm, extraProps,
}: ModalRendererProps) {
  const modalModules = React.useMemo(
    () => UIFeatureRegistry.getModals().sort((a, b) => b.priority - a.priority),
    [],
  );

  return (
    <>
      {modalModules.map(module => {
        if (!module.modal) return null;
        if (module.modal.gameViewOnly && state.view !== 'game') return null;
        if (module.modal.visibility === 'config-dependent' && module.modal.configKey) {
          const config = state.gameConfig as Record<string, unknown> | undefined;
          if (config?.[module.modal.configKey] !== module.modal.configValue) return null;
        }
        if (module.modal.visibility === 'hidden') return null;

        const isOpenViaMap = openModals.has(module.id);
        let isOpenViaState = false;
        if (module.modal.stateKey) {
          const stateVal = state[module.modal.stateKey];
          if (module.id === 'saveLoad' && stateVal && typeof stateVal === 'object') {
            isOpenViaState = (stateVal as { show?: boolean }).show === true;
          } else {
            isOpenViaState = !!stateVal;
          }
        }
        if (!isOpenViaMap && !isOpenViaState) return null;

        const Component = getLazyComponent(module.modal, isMobile, module.id);
        if (!Component) return null;

        const modalManager = {
          open: (id: string, payload?: unknown) => window.dispatchEvent(new CustomEvent('modal:open', { detail: { id, payload } })),
          close: onClose,
          replace: (closeId: string, openId: string, payload?: unknown) => window.dispatchEvent(new CustomEvent('modal:replace', { detail: { closeId, openId, payload } })),
          closeAll: () => window.dispatchEvent(new CustomEvent('modal:closeAll')),
          toggle: (id: string) => window.dispatchEvent(new CustomEvent('modal:toggle', { detail: { id } })),
          isOpen: (id: string) => openModals.has(id),
          openModals,
        };

        const context: ModalPropsContext = { state, meta, setters, actions, modalManager, isMobile, requestConfirm, extraProps };
        const props = module.modal.propsFactory(context);
        if (!props.onClose) props.onClose = () => onClose(module.id);

        return (
          <React.Fragment key={module.id}>
            <懒加载边界>
              <Component {...props} />
            </懒加载边界>
          </React.Fragment>
        );
      })}
    </>
  );
}
