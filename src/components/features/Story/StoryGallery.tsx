/**
 * StoryGallery — 故事图片画廊网格组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U8
 * 目标：故事生成图片的网格画廊 + 点击放大（父组件负责灯箱渲染）
 *
 * 设计：
 * - 网格布局（2-4 列响应式），每张图显示缩略 + 标题（hover）
 * - 点击触发 onSelect 回调（由父组件决定如何放大：灯箱/Modal/全屏）
 * - 零外部依赖，纯 Tailwind + 数据驱动
 * - 不连 image-assets 异步 API — 父组件已 fetch URL 后传入
 */
import React from 'react';

export type StoryImage = {
    id: string;
    url: string;
    title?: string;
    createdAt?: string;
};

export type StoryGalleryProps = {
    images: StoryImage[];
    /** 列数（移动端默认 2，桌面端可改 3/4） */
    columns?: 2 | 3 | 4;
    /** 点击图片回调（父组件做放大/详情） */
    onSelect?: (image: StoryImage) => void;
    /** 自定义 className */
    className?: string;
    /** 自定义空态文案 */
    emptyText?: string;
};

const columnsClass: Record<NonNullable<StoryGalleryProps['columns']>, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export const StoryGallery: React.FC<StoryGalleryProps> = ({
    images,
    columns = 3,
    onSelect,
    className = '',
    emptyText = '暂无故事图片',
}) => {
    if (images.length === 0) {
        return (
            <div
                data-testid="story-gallery-empty"
                className={`rounded-lg border border-dashed border-gray-700 bg-black/30 p-8 text-center text-sm text-gray-500 ${className}`}
            >
                {emptyText}
            </div>
        );
    }

    return (
        <div
            data-testid="story-gallery"
            className={`grid ${columnsClass[columns]} gap-3 ${className}`}
        >
            {images.map((image) => (
                <button
                    key={image.id}
                    type="button"
                    onClick={() => onSelect?.(image)}
                    data-testid={`story-image-${image.id}`}
                    className="group relative overflow-hidden rounded-lg border border-gray-700/60 bg-black/30 hover:border-wuxia-gold/50 transition-all"
                >
                    {/* 缩略图：aspect-square 维持网格整齐 */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black">
                        <img
                            src={image.url}
                            alt={image.title || '故事图片'}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    </div>

                    {/* 标题（始终可见） */}
                    {image.title && (
                        <div className="px-2 py-1.5 text-[11px] text-gray-300 truncate font-serif" title={image.title}>
                            {image.title}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

export default StoryGallery;
