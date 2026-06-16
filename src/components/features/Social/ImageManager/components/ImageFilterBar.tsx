import type { 图片管理筛选条件 } from '@/types';
import { 统计卡 } from '../utils/imageManagerHelpers';
import { 小标题样式 } from '../utils/imageManagerConstants';

interface ImageFilterBarProps {
    activeTab: 'manual' | 'library' | 'scene' | 'queue' | 'history' | 'presets' | 'rules';
    filters: 图片管理筛选条件;
    setFilters: React.Dispatch<React.SetStateAction<图片管理筛选条件>>;
    图片统计: { total: number; success: number; failed: number; pending: number };
    队列统计: { total: number; queued: number; running: number; failed: number };
    npcLibraryGroups: { npc: { 姓名?: string } }[];
    filteredCombinedQueue: unknown[];
    combinedHistoryRecords: unknown[];
}

/**
 * 图片筛选栏 — 统计卡片 + 角色名输入 + 状态下拉
 */
export function ImageFilterBar({
    activeTab,
    filters,
    setFilters,
    图片统计,
    队列统计,
    npcLibraryGroups,
    filteredCombinedQueue,
    combinedHistoryRecords,
}: ImageFilterBarProps) {
    if (activeTab === 'manual' || activeTab === 'scene' || activeTab === 'presets' || activeTab === 'rules') {
        return null;
    }

    return (
        <div className="shrink-0 px-6 py-6 border-b border-wuxia-gold/10 bg-black/30 space-y-5">
            <div className="pr-12">
                <div className="text-wuxia-gold/90 font-serif text-lg tracking-wider">图片筛选</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
                <统计卡 label="图片总数" value={图片统计.total} />
                <统计卡 label="成功" value={图片统计.success} tone="success" />
                <统计卡 label="失败" value={图片统计.failed} tone="danger" />
                <统计卡 label="生成中" value={图片统计.pending} tone="warning" />
                <统计卡 label="队列总数" value={队列统计.total} tone="info" />
                <统计卡 label="排队中" value={队列统计.queued} />
                <统计卡 label="运行中" value={队列统计.running} tone="info" />
                <统计卡 label="队列失败" value={队列统计.failed} tone="danger" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className={小标题样式}>角色名称</label>
                    <input
                        type="text"
                        value={filters.角色姓名 || ''}
                        onChange={(e) => setFilters((prev) => ({ ...prev, 角色姓名: e.target.value }))}
                        placeholder="输入角色名筛选"
                        className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-black/90 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className={小标题样式}>状态筛选</label>
                    <select
                        value={filters.状态 || '全部'}
                        onChange={(e) => setFilters((prev) => ({ ...prev, 状态: e.target.value as 图片管理筛选条件['状态'] }))}
                        className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-black/90 transition-colors"
                    >
                        <option value="全部">全部</option>
                        <option value="success">成功</option>
                        <option value="failed">失败</option>
                        <option value="pending">进行中 / 排队中</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className={小标题样式}>当前统计</label>
                    <div className="h-[38px] rounded border border-wuxia-gold/10 bg-black/40 px-3 flex items-center justify-between text-sm text-gray-300">
                        <span>当前视图</span>
                        <span className="text-wuxia-gold font-medium tracking-widest drop-shadow-md">
                            {activeTab === 'library' && `${npcLibraryGroups.length} 个角色`}
                            {activeTab === 'queue' && `${filteredCombinedQueue.length} 条任务`}
                            {activeTab === 'history' && `${combinedHistoryRecords.length} 条记录`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
