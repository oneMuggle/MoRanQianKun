/**
 * VideoPlayer — 视频内嵌播放组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U9
 * 目标：通用 HTML5 video 包装，支持 controls + 错误处理 + 自定义宽度
 *
 * 设计：
 * - 基于 HTML5 <video>，原生 controls（播放/暂停/进度/音量/全屏）
 * - 错误时显示降级 UI（不破坏整体布局）
 * - 零外部依赖
 * - 不连具体的视频 URL — 父组件传入 src
 */
import React, { useState } from 'react';

export type VideoPlayerProps = {
    src: string;
    /** 视频封面图 URL */
    poster?: string;
    /** 是否显示原生 controls（默认 true） */
    controls?: boolean;
    /** 是否自动播放（默认 false，避免意外播放） */
    autoPlay?: boolean;
    /** 是否循环播放 */
    loop?: boolean;
    /** 是否静音（autoPlay=true 时通常需要 muted=true） */
    muted?: boolean;
    /** 自定义 wrapper className */
    className?: string;
    /** 视频最大宽度（px） */
    maxWidth?: number;
    /** 视频 MIME 类型提示（可选，浏览器通常自动推断） */
    type?: string;
    /** ARIA label */
    ariaLabel?: string;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    controls = true,
    autoPlay = false,
    loop = false,
    muted = false,
    className = '',
    maxWidth,
    type,
    ariaLabel,
}) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div
                data-testid="video-error"
                className={`rounded-lg border border-red-900/40 bg-red-950/20 p-6 text-center ${className}`}
                style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
            >
                <div className="text-red-300 text-sm font-medium mb-1">视频加载失败</div>
                <div className="text-red-400/60 text-xs">源: {src}</div>
            </div>
        );
    }

    return (
        <video
            data-testid="video-player"
            src={src}
            poster={poster}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            className={`rounded-lg border border-gray-700/40 bg-black ${className}`}
            style={{
                ...(maxWidth ? { maxWidth: `${maxWidth}px`, width: '100%' } : { maxWidth: '100%' }),
                display: 'block',
            }}
            aria-label={ariaLabel || '视频播放器'}
            onError={() => setHasError(true)}
        >
            {type && <source src={src} type={type} />}
            您的浏览器不支持 HTML5 video 标签。
        </video>
    );
};

export default VideoPlayer;
