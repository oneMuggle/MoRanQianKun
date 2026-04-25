import type { 发现图片后端记录结构 } from '../../models/system';

interface RegistryResponse {
    backends: Array<{
        id: string;
        label: string;
        backendType: string;
        port: number;
        url: string;
        healthUrl?: string;
        customerId?: string;
        lastHeartbeatAt: string;
        detectedAt: string;
    }>;
    total: number;
    timestamp: string;
}

export const discoverImageBackends = async (
    registryUrl: string,
    options?: { backendType?: string; timeoutMs?: number }
): Promise<发现图片后端记录结构[]> => {
    if (!registryUrl?.trim()) return [];

    const url = new URL(registryUrl.trim());
    if (options?.backendType) {
        url.searchParams.set('backendType', options.backendType);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 5000);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });

        if (!response.ok) return [];

        const data = await response.json() as RegistryResponse;
        return (data.backends || []).map(b => ({
            id: b.id,
            label: b.label,
            backendType: b.backendType as 发现图片后端记录结构['backendType'],
            port: b.port,
            url: b.url,
            healthUrl: b.healthUrl,
            detectedFrom: url.origin,
            detectedAt: b.lastHeartbeatAt,
            lastHeartbeatAt: b.lastHeartbeatAt,
            source: 'registry' as const
        }));
    } catch {
        return [];
    } finally {
        clearTimeout(timeout);
    }
};

export const registerImageBackend = async (
    registryUrl: string,
    payload: {
        id: string;
        label: string;
        backendType: string;
        port: number;
        url: string;
        healthUrl?: string;
        customerId?: string;
    }
): Promise<boolean> => {
    if (!registryUrl?.trim()) return false;

    try {
        const response = await fetch(registryUrl.trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch {
        return false;
    }
};
