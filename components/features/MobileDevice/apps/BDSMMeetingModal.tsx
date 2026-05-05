// BDSM 寻主召奴见面互动 — 聊天式约会场景
// 联系成功后可发起的后续玩法：线下见面、约会、关系推进

import React, { useState, useRef, useEffect } from 'react';
import type { BDSM论坛帖子 } from '../../../../models/campusNSFW/bdsm-forum';

interface Props {
    post: BDSM论坛帖子;
    onBack: () => void;
    onConfirm: () => void;
}

const 见面场景池 = [
    { 地点: '校园咖啡厅', 氛围: '温馨安静的角落，适合初次见面' },
    { 地点: '图书馆后花园', 氛围: '人迹罕至的静谧花园' },
    { 地点: '校外茶室', 氛围: '古色古香的私密包间' },
    { 地点: '湖边长椅', 氛围: '夕阳下的宁静湖畔' },
];

const NPC招呼语: Record<string, string[]> = {
    '寻主': [
        '你来了。我比约定时间早到了十分钟。',
        '终于见到你了，你和帖子里给我的感觉不太一样。',
        '我选了这里，比较安静。你坐吧。',
    ],
    '召奴': [
        '你好，我到了。你看起来比我想象的要...',
        '我在这儿等了很久了。你能来，我很高兴。',
        '你来了。我准备了一些茶，先坐吧。',
    ],
    '不限': [
        '你好，终于见面了。这里环境还不错吧？',
        '很高兴见到你本人。我们先坐吧。',
        '你来了，我有点紧张，但也很期待这次见面。',
    ],
};

const NPC互动回复: string[] = [
    '你说的话让我想起了很多。这种感觉很久违了。',
    '我以前很少和人聊这些。但你给我的感觉很安心。',
    '谢谢你愿意来。我其实一直在担心你不靠谱。',
    '时间过得真快，和你聊天总觉得不够。',
    '我觉得我们比在帖子里说的更合拍。',
];

const BDSMMeetingModal: React.FC<Props> = ({ post, onBack, onConfirm }) => {
    const 招募方角色 = post.寻主召奴信息?.招募方角色 || '不限';
    const npcName = post.寻主召奴信息?.解锁NPC姓名 || post.作者;

    const [messages, setMessages] = useState<{ 发送者: '玩家' | 'NPC'; 内容: string; 时间: string }[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [round, setRound] = useState(0);
    const [phase, setPhase] = useState<'见面' | '互动' | '结束'>('见面');
    const [见面地点] = useState(() => 见面场景池[Math.floor(Math.random() * 见面场景池.length)]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 初始消息
    useEffect(() => {
        const 招呼 = NPC招呼语[招募方角色] || NPC招呼语['不限'];
        const 开场白 = 招呼[Math.floor(Math.random() * 招呼.length)];
        setMessages([
            { 发送者: 'NPC', 内容: `地点：${见面地点.地点}\n${见面地点.氛围}`, 时间: '到达' },
            { 发送者: 'NPC', 内容: 开场白, 时间: '刚刚' },
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim() || isLoading || phase === '结束') return;

        const playerMsg = { 发送者: '玩家' as const, 内容: inputText.trim(), 时间: '刚刚' };
        setMessages(prev => [...prev, playerMsg]);
        setInputText('');
        setIsLoading(true);

        setTimeout(() => {
            const newRound = round + 1;
            const npcReply = newRound <= 2
                ? NPC互动回复[Math.floor(Math.random() * NPC互动回复.length)]
                : '今天的见面让我很愉快。希望以后还有机会。';

            if (newRound >= 3 && phase === '见面') {
                setPhase('互动');
            }

            setMessages(prev => [...prev, { 发送者: 'NPC', 内容: npcReply, 时间: '刚刚' }]);
            setRound(newRound);
            setIsLoading(false);
        }, 1200);
    };

    const handleEndMeeting = () => {
        setPhase('结束');
    };

    return (
        <div className="flex flex-col h-full bg-gray-950">
            {/* 顶部栏 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-green-700/30 bg-green-950/20">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-300 text-sm truncate">见面 - {npcName}</h3>
                    <span className="text-[10px] text-gray-500">{见面地点.地点}</span>
                </div>
                <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    {phase === '见面' ? '初次见面' : phase === '互动' ? '深入互动' : '见面结束'}
                </span>
            </div>

            {/* 聊天区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.发送者 === '玩家' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.发送者 === '玩家'
                                ? 'bg-green-600/60 text-white'
                                : 'bg-gray-800/50 text-gray-200'
                        }`}>
                            {msg.发送者 !== '玩家' && (
                                <div className="text-[9px] text-green-400/60 mb-0.5">{npcName}</div>
                            )}
                            <p>{msg.内容}</p>
                            <span className="text-[9px] text-gray-500 mt-1 block">{msg.时间}</span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-400 animate-pulse">对方正在输入...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 快捷回复 */}
            {phase !== '结束' && round < 3 && (
                <div className="px-4 py-2 border-t border-gray-800/30 flex gap-2 overflow-x-auto">
                    <button onClick={() => setInputText('你好，很高兴见到你。')} className="text-[10px] text-green-300 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full whitespace-nowrap hover:bg-green-500/20 transition-colors">你好，很高兴见到你。</button>
                    <button onClick={() => setInputText('你的帖子里写得很真诚。')} className="text-[10px] text-green-300 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full whitespace-nowrap hover:bg-green-500/20 transition-colors">你的帖子里写得很真诚。</button>
                    <button onClick={() => setInputText('这个地方选得很好。')} className="text-[10px] text-green-300 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full whitespace-nowrap hover:bg-green-500/20 transition-colors">这个地方选得很好。</button>
                </div>
            )}

            {/* 输入框 */}
            {phase !== '结束' && (
                <div className="flex gap-2 px-4 py-3 border-t border-gray-700/50">
                    <input
                        className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                        placeholder="输入回复..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600/80 hover:bg-green-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >发送</button>
                </div>
            )}

            {/* 结束见面按钮 */}
            {phase !== '结束' && round >= 3 && (
                <div className="px-4 py-2 border-t border-gray-800/30">
                    <button
                        onClick={handleEndMeeting}
                        className="w-full py-2 rounded-lg text-sm font-medium bg-green-600/60 hover:bg-green-500 text-white transition-colors"
                    >结束见面</button>
                </div>
            )}

            {/* 确认结果 */}
            {phase === '结束' && (
                <div className="px-4 py-4 border-t border-gray-700/50">
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="text-sm text-green-400 font-medium">见面结束</p>
                            <p className="text-[10px] text-gray-500 mt-1">你们的关系更近了一步</p>
                        </div>
                        <button
                            onClick={onConfirm}
                            className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
                        >确认并继续</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BDSMMeetingModal;
