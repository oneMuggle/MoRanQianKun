import React, { useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 课程 } from '../../../../models/campusPhone';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const CampusScheduleApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '课程表';

    const schedule: Record<string, 课程[]> = useMemo(() => {
        const systemSchedule = gameContext?.校园系统?.课程表;
        if (systemSchedule && Object.keys(systemSchedule).length > 0) {
            return systemSchedule;
        }
        return {};
    }, [gameContext?.校园系统?.课程表]);

    const timeSlots = ['1-2节', '3-4节', '5-6节', '7-8节', '9-10节'];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    const hasData = Object.values(schedule).some(courses => courses.length > 0);

    if (!hasData) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <h3 className="font-semibold text-white">{appName}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center text-center p-8">
                    <div>
                        <span className="text-4xl text-gray-600 mb-3 block">&#128203;</span>
                        <p className="text-sm text-gray-400">暂无课程表</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-2">
                    {days.map(day => <span key={day}>{day}</span>)}
                </div>
                {timeSlots.map(slot => (
                    <div key={slot} className="mb-2">
                        <div className="text-[10px] text-gray-500 mb-1">{slot}</div>
                        <div className="grid grid-cols-7 gap-1">
                            {days.map(day => {
                                const course = schedule[day]?.find(c => c.时间段 === slot);
                                return (
                                    <div key={`${day}-${slot}`} className={`rounded p-1 min-h-[48px] text-[10px] ${course ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'bg-gray-800/20 border border-gray-800/20'}`}>
                                        {course && (
                                            <div>
                                                <div className="font-medium truncate">{course.名称}</div>
                                                <div className="text-gray-400 truncate">{course.地点}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CampusScheduleApp;
