import React from 'react';
import MobileDevice from './MobileDevice';
import { DeviceState, MobileApp, DeviceMode, DeviceGameContext } from '../../../models/mobileDevice';

interface MobileDeviceModalProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onModeToggle: (mode: DeviceMode) => void;
    liModeGlobalEnabled: boolean;
    onClose: () => void;
    gameContext?: DeviceGameContext;
}

const MobileDeviceModal: React.FC<MobileDeviceModalProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onModeToggle,
    liModeGlobalEnabled,
    onClose,
    gameContext,
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
                    onReturnHome={onReturnHome}
                    onModeToggle={onModeToggle}
                    liModeGlobalEnabled={liModeGlobalEnabled}
                    onClose={onClose}
                    gameContext={gameContext}
                />
            </div>
        </div>
    );
};

export default MobileDeviceModal;
