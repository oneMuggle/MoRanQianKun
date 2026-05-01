import React, { useState } from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
}

interface ForumPost {
    id: string;
    author: string;
    title: string;
    content: string;
    category: string;
    time: string;
    replies: number;
    views: number;
    replyList: { author: string; content: string; time: string }[];
}

const ForumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '论坛';
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [activeCategory, setActiveCategory] = useState('全部');

    const categories = ['全部', '武林杂谈', '求师问道', '江湖情报', '江湖趣事'];

    const placeholderPosts: ForumPost[] = [
        {
            id: '1', author: '华山剑客', title: '今日论剑，紫霞神功果然了得',
            content: '今日在华山之巅与几位同道切磋，紫霞神功内力绵长，后劲十足，实为正派内功中的上乘功夫。唯觉修炼门槛颇高，非十余年苦功不能窥其门径。',
            category: '武林杂谈', time: '申时', replies: 12, views: 342,
            replyList: [
                { author: '嵩山弟子', content: '紫霞神功确是好功夫，但我嵩山派大阳神掌也不遑多让！', time: '申时一刻' },
                { author: '无名散人', content: '内功之道，贵在专精。各家各派皆有绝学，不必厚此薄彼。', time: '申时二刻' },
            ],
        },
        {
            id: '2', author: '丐帮长老', title: '求问降龙十八掌传人 whereabouts',
            content: '帮中古籍记载，降龙十八掌乃丐帮镇帮绝学。近年来却鲜有传人消息，哪位英雄知晓现任传人的下落？',
            category: '求师问道', time: '午时', replies: 8, views: 215,
            replyList: [
                { author: '江湖百晓生', content: '传闻在襄阳一带出现过，郭大侠的后人应当还在坚守此地。', time: '午时一刻' },
            ],
        },
        {
            id: '3', author: '暗桩密探', title: '【密报】明教总坛近日异动频繁',
            content: '据可靠消息，明教总坛近日有大批高手聚集，似在筹备某件大事。请各位同道提前做好准备，以免措手不及。',
            category: '江湖情报', time: '辰时', replies: 23, views: 567,
            replyList: [
                { author: '六扇门捕头', content: '多谢提醒，已派人暗中查探。', time: '辰时一刻' },
                { author: '峨眉女侠', content: '师太已经注意到了，命我等加强戒备。', time: '辰时二刻' },
                { author: '武当道士', content: '师父说此事自有定数，不必惊慌。', time: '辰时三刻' },
            ],
        },
        {
            id: '4', author: '茶楼说书人', title: '笑谈：某大侠夜奔客栈，误入女客房',
            content: '话说前日有位大侠月夜赶路，误入一家客栈，摸黑进了客房。次日天明才发现走错了，隔壁住的是一位峨眉女侠。那女侠拔剑就追，大侠连跑三条街……',
            category: '江湖趣事', time: '昨日', replies: 45, views: 1024,
            replyList: [
                { author: '路人甲', content: '哈哈哈，这位大侠怕不是令狐冲？', time: '昨日酉时' },
                { author: '知情者', content: '此事确有其事，我便是那客栈的店小二！', time: '昨日戌时' },
            ],
        },
    ];

    const filteredPosts = activeCategory === '全部'
        ? placeholderPosts
        : placeholderPosts.filter((p) => p.category === activeCategory);

    if (selectedPost) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white transition-colors">←</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{selectedPost.title}</h3>
                        <span className="text-[10px] text-gray-500">{selectedPost.author} · {selectedPost.time}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-wuxia-gold/60 bg-wuxia-gold/10 px-1.5 py-0.5 rounded">{selectedPost.category}</span>
                            <span className="text-[10px] text-gray-500">{selectedPost.views} 浏览</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">{selectedPost.content}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">{selectedPost.replies} 条回复</h4>
                        <div className="space-y-3">
                            {selectedPost.replyList.map((reply, idx) => (
                                <div key={idx} className="rounded-lg bg-gray-900/40 border border-gray-800/30 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-wuxia-gold/70">{reply.author}</span>
                                        <span className="text-[10px] text-gray-500">{reply.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{reply.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-800/30">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-wuxia-gold/20 text-wuxia-gold' : 'text-gray-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-800/50">
                    {filteredPosts.map((post) => (
                        <li key={post.id}>
                            <button
                                onClick={() => setSelectedPost(post)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] text-wuxia-gold/60 bg-wuxia-gold/10 px-1.5 py-0.5 rounded">{post.category}</span>
                                    <span className="text-sm text-white font-medium truncate">{post.title}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                    <span>{post.author}</span>
                                    <span>{post.time}</span>
                                    <span>回复 {post.replies}</span>
                                    <span>浏览 {post.views}</span>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ForumApp;
