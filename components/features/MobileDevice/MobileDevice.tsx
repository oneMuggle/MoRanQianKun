import React from 'react';
import MobileHome from './MobileHome';
import { DeviceState, MobileApp, DeviceMode } from '../../../models/mobileDevice';

interface MobileDeviceProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onModeToggle: (mode: DeviceMode) => void;
    liModeGlobalEnabled: boolean;
    onClose: () => void;
}

const MobileDevice: React.FC<MobileDeviceProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onModeToggle,
    liModeGlobalEnabled,
    onClose,
}) => {
    return (
        <div className="w-full h-full bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
            <MobileHome
                eraId={eraId}
                deviceState={deviceState}
                onAppClick={onAppClick}
                onModeToggle={onModeToggle}
                liModeGlobalEnabled={liModeGlobalEnabled}
                onClose={onClose}
            />
        </div>
    );
};

export default MobileDevice;
