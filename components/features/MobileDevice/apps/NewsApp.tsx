import React, { useState } from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
}

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    summary: string;
    category: string;
    urgent: boolean;
}

const NewsApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '资讯';

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const placeholderNews: NewsItem[] = [
        {
            id: '1', title: '华山论剑大会将于下月十五举行', source: '武林快报', time: '今日辰时',
            summary: '武林盟主发出英雄帖，广发天下英雄。届时华山之巅将举行新一届论剑大会，诚邀各门各派高手赴会。据悉，此次论剑将分内功、外功、轻功三项比试，胜者可得"天下第一"美誉。',
            category: '武林盛事', urgent: true,
        },
        {
            id: '2', title: '西域丝绸之路商队遭马贼劫掠', source: '商旅周报', time: '昨日未时',
            summary: '一支往来于长安与敦煌之间的商队在玉门关外遭遇马贼劫掠，损失货物若干。所幸随行镖师奋力抵抗，无人伤亡。建议近日往来商队结伴而行，并请官府派兵护送。',
            category: '商旅情报', urgent: false,
        },
        {
            id: '3', title: '峨眉派新任掌门正式继位', source: '名门正派通讯', time: '三日前',
            summary: '峨眉派老掌门正式退位，由大弟子接任掌门之位。新掌门年轻有为，武学天赋极高，深得老掌门真传。各门派纷纷派出使节前往道贺。',
            category: '门派要闻', urgent: false,
        },
        {
            id: '4', title: '江南出现神秘剑客，连挑七大门派分舵', source: '江湖暗报', time: '五日前',
            summary: '据传江南一带出现一神秘剑客，手持长剑，连挑七个门派的江南分舵。此人行踪飘忽，剑法奇诡，至今无人能敌。六扇门已发出海捕文书，悬银千两捉拿此人。',
            category: '江湖暗流', urgent: true,
        },
        {
            id: '5', title: '武当山发现前朝武学秘籍残卷', source: '古籍研究季刊', time: '半月前',
            summary: '武当派弟子在修缮藏经阁时，意外发现一批前朝武学秘籍的残卷。据初步鉴定，其中包含数种失传已久的内功心法。武当派已组织专人整理研究。',
            category: '武学发现', urgent: false,
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
                {placeholderNews.some((n) => n.urgent) && (
                    <span className="ml-auto text-[10px] text-red-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                        紧急
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-800/50">
                    {placeholderNews.map((news) => {
                        const isExpanded = expandedId === news.id;
                        return (
                            <li key={news.id}>
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : news.id)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {news.urgent && (
                                                    <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">急</span>
                                                )}
                                                <span className="text-[10px] text-wuxia-gold/60 bg-wuxia-gold/10 px-1.5 py-0.5 rounded">{news.category}</span>
                                            </div>
                                            <h4 className="text-sm text-white font-medium mb-1">{news.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                <span>{news.source}</span>
                                                <span>{news.time}</span>
                                            </div>
                                            {isExpanded && (
                                                <p className="text-xs text-gray-300 mt-2 leading-relaxed">{news.summary}</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default NewsApp;
