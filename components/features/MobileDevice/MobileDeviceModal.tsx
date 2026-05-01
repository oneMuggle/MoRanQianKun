import React from 'react';
import MobileDevice from './MobileDevice';
import { DeviceState, MobileApp, DeviceMode } from '../../../models/mobileDevice';

interface MobileDeviceModalProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onModeToggle: (mode: DeviceMode) => void;
    liModeGlobalEnabled: boolean;
    onClose: () => void;
}

const MobileDeviceModal: React.FC<MobileDeviceModalProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onModeToggle,
    liModeGlobalEnabled,
    onClose,
}) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg h-[70vh] mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <MobileDevice
                    eraId={eraId}
                    deviceState={deviceState}
                    onAppClick={onAppClick}
                    onModeToggle={onModeToggle}
                    liModeGlobalEnabled={liModeGlobalEnabled}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};

export default MobileDeviceModal;
