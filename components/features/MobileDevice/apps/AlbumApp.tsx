import React from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
}

interface AlbumImage {
    id: string;
    thumbnail: string;
    title: string;
    date: string;
}

const AlbumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '相册';

    // TODO: 从游戏图片系统加载真实数据
    const placeholderImages: AlbumImage[] = [
        { id: '1', thumbnail: '🏔️', title: '山间风景', date: '甲子年三月初一' },
        { id: '2', thumbnail: '🌸', title: '春日花开', date: '甲子年二月初八' },
        { id: '3', thumbnail: '🏯', title: '古城遗迹', date: '甲子年正月十五' },
        { id: '4', thumbnail: '🌊', title: '海边日出', date: '癸亥年腊月廿八' },
        { id: '5', thumbnail: '🌙', title: '月下独酌', date: '癸亥年腊月初五' },
        { id: '6', thumbnail: '🍂', title: '秋日落叶', date: '癸亥年九月初三' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
                <span className="text-xs text-gray-500 ml-auto">{placeholderImages.length} 张</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {placeholderImages.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden bg-gray-800/60 border border-gray-700/30 hover:border-wuxia-gold/40 transition-colors cursor-pointer group">
                            <div className="aspect-square flex items-center justify-center text-4xl bg-gray-900/50 group-hover:scale-105 transition-transform">
                                {img.thumbnail}
                            </div>
                            <div className="px-2 py-1.5">
                                <div className="text-xs text-white truncate">{img.title}</div>
                                <div className="text-[10px] text-gray-500 truncate">{img.date}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumApp;
