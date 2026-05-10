import React, { useState, useCallback } from 'react';
import type { DebugTurnLog } from '../../../types';
import { useDebugLogger } from '../../../hooks/useDebugLogger';

interface MobileDebugPanelProps {
    isDebugMode: boolean;
    onToggleDebug: (enabled: boolean) => void;
    maxLogs: number;
    onMaxLogsChange: (n: number) => void;
}

export const MobileDebugPanel: React.FC<MobileDebugPanelProps> = ({
    isDebugMode,
    onToggleDebug,
    maxLogs,
    onMaxLogsChange,
}) => {
    const { turnLogs, clearLogs, exportLogs } = useDebugLogger(isDebugMode);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const toggleSection = useCallback((key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    if (!isDebugMode) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="mb-4">调试模式已关闭</p>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isDebugMode}
                        onChange={e => onToggleDebug(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span>启用调试模式</span>
                </label>
            </div>
        );
    }

    if (turnLogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                暂无日志，发送一条消息后即可查看
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-3 p-3 text-sm">
            {/* 控制栏 */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={clearLogs}
                    className="px-2 py-1 rounded bg-red-900/30 text-red-300 text-xs"
                >
                    清空
                </button>
                <button
                    onClick={exportLogs}
                    className="px-2 py-1 rounded bg-blue-900/30 text-blue-300 text-xs"
                >
                    导出
                </button>
                <div className="flex items-center gap-1 ml-auto">
                    <label className="text-xs text-gray-400">保留:</label>
                    <input
                        type="number"
                        min={5}
                        max={100}
                        value={maxLogs}
                        onChange={e => onMaxLogsChange(Number(e.target.value))}
                        className="w-14 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center text-xs"
                    />
                </div>
            </div>

            {/* 轮次列表（垂直堆叠） */}
            <div className="text-xs text-gray-400 mb-1">共 {turnLogs.length} 条</div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {[...turnLogs].reverse().map((log, revIdx) => {
                    const idx = turnLogs.length - 1 - revIdx;
                    return (
                        <TurnCard key={idx} log={log} expandedSections={expandedSections} toggleSection={toggleSection} />
                    );
                })}
            </div>
        </div>
    );
};

const TurnCard: React.FC<{
    log: DebugTurnLog;
    expandedSections: Record<string, boolean>;
    toggleSection: (key: string) => void;
}> = ({ log, expandedSections, toggleSection }) => {
    const sections: Array<{ key: string; label: string; content: React.ReactNode }> = [
        {
            key: 'meta',
            label: '元信息',
            content: (
                <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>Turn #{log.turnIndex}</div>
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div>输入: {log.totalInputChars.toLocaleString()} 字符</div>
                    <div>响应: {log.rawResponse.length.toLocaleString()} 字符</div>
                </div>
            ),
        },
        {
            key: 'analysis',
            label: '响应分析',
            content: log.responseAnalysis ? (
                <div className="text-xs space-y-1">
                    <div>标签存在: <span className="text-green-400">{log.responseAnalysis.tagsPresent.join(', ') || '无'}</span></div>
                    <div>标签缺失: <span className={log.responseAnalysis.tagsMissing.length > 0 ? 'text-red-400' : 'text-green-400'}>{log.responseAnalysis.tagsMissing.join(', ') || '无'}</span></div>
                    <div>
                        行动选项: {log.responseAnalysis.hasActionOptions ? '有' : '无'} |
                        命令: {log.responseAnalysis.hasCommands ? '有' : '无'} |
                        动态世界: {log.responseAnalysis.hasDynamicWorld ? '有' : '无'}
                    </div>
                </div>
            ) : null,
        },
        {
            key: 'rawResponse',
            label: '原始回复',
            content: (
                <pre className="text-xs p-2 bg-gray-900/50 rounded overflow-auto max-h-80 whitespace-pre-wrap">
                    {log.rawResponse}
                </pre>
            ),
        },
        {
            key: 'parsedResponse',
            label: '解析后响应',
            content: log.parsedResponse ? (
                <pre className="text-xs p-2 bg-gray-900/50 rounded overflow-auto max-h-80">
                    {JSON.stringify(log.parsedResponse, null, 2)}
                </pre>
            ) : <span className="text-gray-500 text-xs">无解析结果</span>,
        },
    ];

    return (
        <div className="border border-gray-700 rounded p-2">
            <div className="text-xs text-gray-400 mb-1">
                Turn #{log.turnIndex} — {new Date(log.timestamp).toLocaleTimeString()}
            </div>
            {sections.map(section => (
                <div key={section.key} className="border border-gray-700 rounded mb-1">
                    <button
                        onClick={() => toggleSection(`${log.turnIndex}-${section.key}`)}
                        className="w-full text-left px-2 py-1.5 bg-gray-800/50 text-gray-200 font-medium text-xs"
                    >
                        {expandedSections[`${log.turnIndex}-${section.key}`] ? '▼' : '▶'} {section.label}
                    </button>
                    {expandedSections[`${log.turnIndex}-${section.key}`] && section.content && (
                        <div className="p-2 border-t border-gray-700">
                            {section.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MobileDebugPanel;
