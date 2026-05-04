import React, { useState, useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 论坛帖子 } from '../../../../models/campusPhone';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    onRefresh?: () => void;
}

const CampusForumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, onRefresh }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '校园论坛';
    const [selectedPost, setSelectedPost] = useState<论坛帖子 | null>(null);
    const [activeCategory, setActiveCategory] = useState('全部');

    const categories = ['全部', '校园资讯', '学术交流', '社团活动', '情感树洞', '匿名灌水', '求助答疑'];

    const 回复话术池 = [
        '确实如此，深有同感。',
        '此楼说得在理。',
        '我也遇到过类似的情况。',
        '楼上说的对，补充一下我的看法。',
        '不太同意，事情没那么简单。',
        '这个观点很有意思。',
        '感谢分享，学到了。',
    ];

    const posts: 论坛帖子[] = useMemo(() => {
        const systemPosts = gameContext?.校园系统?.论坛帖子列表;
        if (systemPosts && systemPosts.length > 0) return systemPosts;

        const result: 论坛帖子[] = [];
        const events = gameContext?.世界?.进行中事件 || [];
        events.forEach((event, idx) => {
            const replies = (event.关联人物 || []).slice(1, 4).map((person, ri) => ({
                id: `reply-${idx}-${ri}`,
                作者: person,
                内容: 回复话术池[(idx + ri) % 回复话术池.length],
                回复时间: event.开始时间 || '近日',
                楼层: ri + 1,
            }));
            result.push({
                id: `event-${idx}`,
                作者: event.关联人物?.[0] || '匿名',
                标题: event.事件名,
                内容: event.事件说明 || '',
                分类: '校园资讯',
                发布时间: event.开始时间 || '近日',
                回复数: replies.length,
                浏览数: (idx + 1) * 100,
                点赞数: Math.max(1, 10 - idx),
                是否置顶: idx === 0,
                是否精华: false,
                回复列表: replies,
            });
        });
        return result;
    }, [gameContext?.校园系统?.论坛帖子列表, gameContext?.世界?.进行中事件]);

    const filteredPosts = activeCategory === '全部'
        ? posts
        : posts.filter(p => p.分类 === activeCategory);

    if (selectedPost) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{selectedPost.标题}</h3>
                        <span className="text-[10px] text-gray-500">{selectedPost.作者} &middot; {selectedPost.发布时间}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-blue-400/60 bg-blue-400/10 px-1.5 py-0.5 rounded">{selectedPost.分类}</span>
                            <span className="text-[10px] text-gray-500">{selectedPost.浏览数} 浏览</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selectedPost.内容}</p>
                    </div>
                    {selectedPost.回复列表.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">{selectedPost.回复列表.length} 条回复</h4>
                            <div className="space-y-3">
                                {selectedPost.回复列表.map(reply => (
                                    <div key={reply.id} className="rounded-lg bg-gray-900/40 border border-gray-800/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-blue-300/70">{reply.作者}</span>
                                            <span className="text-[10px] text-gray-500">{reply.回复时间}</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{reply.内容}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white flex-1">{appName}</h3>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="text-xs bg-purple-600/80 hover:bg-purple-500 text-white px-2 py-1 rounded transition-colors"
                    >AI 刷新</button>
                )}
            </div>
            <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-800/30">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredPosts.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {filteredPosts.map(post => (
                            <li key={post.id}>
                                <button
                                    onClick={() => setSelectedPost(post)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {post.是否置顶 && <span className="text-[10px] text-red-400 bg-red-400/10 px-1 rounded">置顶</span>}
                                        <span className="text-[10px] text-blue-400/60 bg-blue-400/10 px-1.5 py-0.5 rounded">{post.分类}</span>
                                        <span className="text-sm text-white font-medium truncate">{post.标题}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                        <span>{post.作者}</span>
                                        <span>{post.发布时间}</span>
                                        <span>回复 {post.回复数}</span>
                                        <span>浏览 {post.浏览数}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">&#128203;</span>
                        <p className="text-sm text-gray-400">暂无帖子</p>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="mt-3 text-xs bg-purple-600/80 hover:bg-purple-500 text-white px-4 py-2 rounded transition-colors"
                            >AI 生成内容</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusForumApp;
