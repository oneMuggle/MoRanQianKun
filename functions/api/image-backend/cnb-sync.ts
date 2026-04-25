const JSON_HEADERS = {
    'Content-Type': 'application/json'
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Registry-Token'
};

const DEFAULT_TTL_SECONDS = 300;
const MAX_BACKENDS = 50;

const buildJsonResponse = (payload: unknown, status = 200): Response => {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...JSON_HEADERS,
            ...CORS_HEADERS
        }
    });
};

export async function onRequestOptions(): Promise<Response> {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
    });
}

interface BackendReport {
    id: string;
    label: string;
    backendType: string;
    port: number;
    url: string;
    healthUrl?: string;
    customerId?: string;
}

interface RegistryRecord {
    id: string;
    label: string;
    backendType: string;
    port: number;
    url: string;
    healthUrl?: string;
    customerId?: string;
    lastHeartbeatAt: string;
    detectedAt: string;
}

const parseRequestBody = async (request: Request): Promise<unknown> => {
    const text = await request.text();
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

const isValidReport = (body: unknown): body is BackendReport => {
    if (!body || typeof body !== 'object') return false;
    const b = body as Record<string, unknown>;
    return (
        typeof b.id === 'string' && b.id.length > 0 &&
        typeof b.label === 'string' && b.label.length > 0 &&
        typeof b.backendType === 'string' &&
        typeof b.port === 'number' && b.port > 0 && b.port < 65536 &&
        typeof b.url === 'string' && b.url.length > 0
    );
};

const tryR2Operation = async (
    env: Record<string, unknown>,
    key: string,
    value: string | null
): Promise<boolean> => {
    const r2 = env.CNB_BACKEND_BUCKET as R2Bucket | undefined;
    if (!r2) return false;
    try {
        if (value === null) {
            await r2.delete(key);
        } else {
            await r2.put(key, value);
        }
        return true;
    } catch {
        return false;
    }
};

const tryKVOperation = async (
    env: Record<string, unknown>,
    key: string,
    value: string | null,
    ttl?: number
): Promise<boolean> => {
    const kv = env.CNB_BACKEND_KV as KVNamespace | undefined;
    if (!kv) return false;
    try {
        if (value === null) {
            await kv.delete(key);
        } else {
            await kv.put(key, value, { expirationTtl: ttl });
        }
        return true;
    } catch {
        return false;
    }
};

const storeBackend = async (
    env: Record<string, unknown>,
    key: string,
    record: RegistryRecord
): Promise<boolean> => {
    const value = JSON.stringify(record);
    const ttl = DEFAULT_TTL_SECONDS + 60;
    if (await tryR2Operation(env, key, value)) return true;
    return await tryKVOperation(env, key, value, ttl);
};

const deleteBackend = async (
    env: Record<string, unknown>,
    key: string
): Promise<boolean> => {
    await tryR2Operation(env, key, null);
    return await tryKVOperation(env, key, null);
};

const listAllBackends = async (
    env: Record<string, unknown>
): Promise<RegistryRecord[]> => {
    const records: RegistryRecord[] = [];
    const now = Date.now();

    const r2 = env.CNB_BACKEND_BUCKET as R2Bucket | undefined;
    if (r2) {
        try {
            let cursor: string | undefined;
            do {
                const listed = await r2.list({ cursor, prefix: 'backend:' });
                for (const obj of listed.objects) {
                    const text = await obj.text();
                    try {
                        const record = JSON.parse(text) as RegistryRecord;
                        const heartbeat = new Date(record.lastHeartbeatAt).getTime();
                        if (now - heartbeat < DEFAULT_TTL_SECONDS * 1000) {
                            records.push(record);
                        } else {
                            await r2.delete(obj.key);
                        }
                    } catch {
                        await r2.delete(obj.key);
                    }
                }
                cursor = listed.truncated ? listed.cursor : undefined;
            } while (cursor);
            if (records.length > 0) return records.slice(0, MAX_BACKENDS);
        } catch {
            // R2 failed, fall through to KV
        }
    }

    const kv = env.CNB_BACKEND_KV as KVNamespace | undefined;
    if (kv) {
        try {
            const listed = await kv.list({ prefix: 'backend:' });
            for (const key of listed.keys) {
                const value = await kv.get(key.name);
                if (!value) continue;
                try {
                    const record = JSON.parse(value) as RegistryRecord;
                    const heartbeat = new Date(record.lastHeartbeatAt).getTime();
                    if (now - heartbeat < DEFAULT_TTL_SECONDS * 1000) {
                        records.push(record);
                    } else {
                        await kv.delete(key.name);
                    }
                } catch {
                    await kv.delete(key.name);
                }
            }
        } catch {
            // KV also failed, return empty
        }
    }

    return records.slice(0, MAX_BACKENDS);
};

export async function onRequestPost(context: EventContext<Env, string, {}>): Promise<Response> {
    const body = await parseRequestBody(context.request);
    if (!isValidReport(body)) {
        return buildJsonResponse({ error: 'invalid_request', message: 'Missing required fields: id, label, backendType, port, url' }, 400);
    }

    const key = `backend:${body.id}`;
    const record: RegistryRecord = {
        id: body.id,
        label: body.label,
        backendType: body.backendType,
        port: body.port,
        url: body.url,
        healthUrl: body.healthUrl,
        customerId: body.customerId,
        lastHeartbeatAt: new Date().toISOString(),
        detectedAt: new Date().toISOString()
    };

    const stored = await storeBackend(context.env as unknown as Record<string, unknown>, key, record);
    if (!stored) {
        return buildJsonResponse({ error: 'storage_unavailable', message: 'No storage backend available (R2 or KV required)' }, 503);
    }

    return buildJsonResponse({
        success: true,
        id: body.id,
        label: body.label,
        lastHeartbeatAt: record.lastHeartbeatAt
    });
}

export async function onRequestGet(context: EventContext<Env, string, {}>): Promise<Response> {
    const url = new URL(context.request.url);
    const filterId = url.searchParams.get('id');
    const filterType = url.searchParams.get('backendType');

    const allBackends = await listAllBackends(context.env as unknown as Record<string, unknown>);
    let filtered = allBackends;

    if (filterId) {
        filtered = filtered.filter(b => b.id === filterId);
    }
    if (filterType) {
        filtered = filtered.filter(b => b.backendType === filterType);
    }

    return buildJsonResponse({
        backends: filtered,
        total: filtered.length,
        timestamp: new Date().toISOString()
    });
}

export async function onRequestDelete(context: EventContext<Env, string, {}>): Promise<Response> {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) {
        return buildJsonResponse({ error: 'missing_id', message: 'Query parameter "id" is required' }, 400);
    }

    const key = `backend:${id}`;
    await deleteBackend(context.env as unknown as Record<string, unknown>, key);

    return buildJsonResponse({ success: true, id });
}

export async function onRequest(context: EventContext<Env, string, {}>): Promise<Response> {
    return buildJsonResponse({ error: 'method_not_allowed', message: 'Use GET, POST, or DELETE' }, 405);
}
