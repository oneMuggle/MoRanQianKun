import React, { useState, useMemo, useCallback } from 'react';
import type { DebugTurnLog } from '@/types';
import { useDebugLogger } from '../../../../hooks/useDebugLogger';

interface DebugPanelProps {
    isDebugMode: boolean;
    onToggleDebug: (enabled: boolean) => void;
    maxLogs: number;
    onMaxLogsChange: (n: number) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
    isDebugMode,
    onToggleDebug,
    maxLogs,
    onMaxLogsChange,
}) => {
    const { turnLogs, clearLogs, exportLogs } = useDebugLogger(isDebugMode);
    const [selectedTurn, setSelectedTurn] = useState<number | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const activeLog = useMemo(() => {
        if (selectedTurn == null || selectedTurn < 0 || selectedTurn >= turnLogs.length) return null;
        return turnLogs[selectedTurn];
    }, [turnLogs, selectedTurn]);

    const toggleSection = useCallback((key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 p-4 text-sm">
            {/* 顶部控制栏 */}
            <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isDebugMode}
                        onChange={e => onToggleDebug(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="font-medium">启用调试模式</span>
                </label>
                <button
                    onClick={clearLogs}
                    disabled={!isDebugMode || turnLogs.length === 0}
                    className="px-2 py-1 rounded bg-red-900/30 text-red-300 disabled:opacity-40 hover:bg-red-900/50"
                >
                    清空日志
                </button>
                <button
                    onClick={exportLogs}
                    disabled={!isDebugMode || turnLogs.length === 0}
                    className="px-2 py-1 rounded bg-blue-900/30 text-blue-300 disabled:opacity-40 hover:bg-blue-900/50"
                >
                    导出 JSON
                </button>
                <div className="flex items-center gap-1 ml-auto">
                    <label className="text-xs text-gray-400">保留条数:</label>
                    <input
                        type="number"
                        min={5}
                        max={100}
                        value={maxLogs}
                        onChange={e => onMaxLogsChange(Number(e.target.value))}
                        className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
                    />
                </div>
            </div>

            {!isDebugMode && (
                <div className="text-center text-gray-500 py-8">调试模式已关闭，请在上方勾选启用</div>
            )}

            {isDebugMode && turnLogs.length === 0 && (
                <div className="text-center text-gray-500 py-8">暂无日志，发送一条消息后即可查看</div>
            )}

            {isDebugMode && turnLogs.length > 0 && (
                <div className="flex flex-1 gap-3 min-h-0">
                    {/* 左侧：轮次列表 */}
                    <div className="w-48 flex-shrink-0 overflow-y-auto border border-gray-700 rounded p-2">
                        <div className="text-xs text-gray-400 mb-2">共 {turnLogs.length} 条</div>
                        {turnLogs.map((log, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setSelectedTurn(idx); setExpandedSections({}); }}
                                className={`w-full text-left px-2 py-1.5 rounded mb-1 text-xs transition ${
                                    selectedTurn === idx
                                        ? 'bg-blue-900/50 text-blue-200'
                                        : 'hover:bg-gray-700/50 text-gray-300'
                                }`}
                            >
                                <div>Turn #{log.turnIndex}</div>
                                <div className="text-gray-500">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="text-gray-500 truncate">
                                    {log.responseAnalysis?.logCount ?? '?'} logs
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 右侧：详情 */}
                    <div className="flex-1 overflow-y-auto min-w-0">
                        {activeLog ? <TurnDetail log={activeLog} expandedSections={expandedSections} toggleSection={toggleSection} /> : (
                            <div className="text-gray-500 text-center py-8">点击左侧轮次查看详情</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TurnDetail: React.FC<{
    log: DebugTurnLog;
    expandedSections: Record<string, boolean>;
    toggleSection: (key: string) => void;
}> = ({ log, expandedSections, toggleSection }) => {
    const sections: Array<{ key: string; label: string; content: React.ReactNode }> = [
        {
            key: 'meta',
            label: '元信息',
            content: (
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Turn 编号: <span className="text-blue-300">{log.turnIndex}</span></div>
                    <div>时间: <span className="text-blue-300">{new Date(log.timestamp).toLocaleString()}</span></div>
                    <div>输入字符: <span className="text-blue-300">{log.totalInputChars.toLocaleString()}</span></div>
                    <div>响应字符: <span className="text-blue-300">{log.rawResponse.length.toLocaleString()}</span></div>
                    {log.apiConfig && <div>模型: <span className="text-blue-300">{log.apiConfig.provider} / {log.apiConfig.model}</span></div>}
                </div>
            ),
        },
        {
            key: 'analysis',
            label: '响应分析',
            content: log.responseAnalysis ? (
                <div className="text-xs space-y-2">
                    <div>
                        <span>协议标签存在: </span>
                        <span className="text-green-400">{log.responseAnalysis.tagsPresent.join(', ') || '无'}</span>
                    </div>
                    <div>
                        <span>协议标签缺失: </span>
                        <span className={log.responseAnalysis.tagsMissing.length > 0 ? 'text-red-400' : 'text-green-400'}>{log.responseAnalysis.tagsMissing.join(', ') || '无'}</span>
                    </div>
                    <div className="flex gap-4">
                        <span>行动选项: <span className={log.responseAnalysis.hasActionOptions ? 'text-green-400' : 'text-red-400'}>{log.responseAnalysis.hasActionOptions ? '有' : '无'}</span></span>
                        <span>命令: <span className={log.responseAnalysis.hasCommands ? 'text-green-400' : 'text-gray-400'}>{log.responseAnalysis.hasCommands ? '有' : '无'}</span></span>
                        <span>动态世界: <span className={log.responseAnalysis.hasDynamicWorld ? 'text-green-400' : 'text-gray-400'}>{log.responseAnalysis.hasDynamicWorld ? '有' : '无'}</span></span>
                    </div>
                </div>
            ) : null,
        },
        {
            key: 'systemPrompt',
            label: `系统提示词片段 (${log.systemPromptPieces.length} 个)`,
            content: (
                <div className="space-y-1">
                    {log.systemPromptPieces.map((piece, i) => (
                        <details key={i} className="text-xs">
                            <summary className="cursor-pointer text-gray-300 hover:text-white">
                                {piece.section} <span className="text-gray-500">({piece.charCount} 字符)</span>
                            </summary>
                            <pre className="mt-1 p-2 bg-gray-900/50 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                {piece.content}
                            </pre>
                        </details>
                    ))}
                </div>
            ),
        },
        {
            key: 'promptStates',
            label: `提示词状态 (${log.promptStates.length} 个)`,
            content: (
                <div className="grid grid-cols-2 gap-1 text-xs">
                    {log.promptStates.map((ps, i) => (
                        <div key={i} className={`px-1 py-0.5 rounded ${ps.status === 'enabled' ? 'text-green-400' : 'text-gray-500'}`}>
                            {ps.promptId}: {ps.status}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'rawResponse',
            label: `原始回复 (${log.rawResponse.length} 字符)`,
            content: (
                <pre className="text-xs p-2 bg-gray-900/50 rounded overflow-auto max-h-96 whitespace-pre-wrap">
                    {log.rawResponse}
                </pre>
            ),
        },
        {
            key: 'parsedResponse',
            label: '解析后响应',
            content: log.parsedResponse ? (
                <pre className="text-xs p-2 bg-gray-900/50 rounded overflow-auto max-h-96">
                    {JSON.stringify(log.parsedResponse, null, 2)}
                </pre>
            ) : <span className="text-gray-500 text-xs">无解析结果</span>,
        },
    ];

    return (
        <div className="space-y-2">
            {sections.map(section => (
                <div key={section.key} className="border border-gray-700 rounded">
                    <button
                        onClick={() => toggleSection(section.key)}
                        className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-200 font-medium text-xs transition"
                    >
                        {expandedSections[section.key] ? '▼' : '▶'} {section.label}
                    </button>
                    {expandedSections[section.key] && section.content && (
                        <div className="p-3 border-t border-gray-700">
                            {section.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DebugPanel;
