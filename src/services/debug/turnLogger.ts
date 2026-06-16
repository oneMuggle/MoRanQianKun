import type { DebugTurnLog } from '@/types';

class TurnLogger {
    private buffer: DebugTurnLog[] = [];
    private maxSize = 20;
    private listeners: Set<() => void> = new Set();

    setMaxSize(n: number) {
        this.maxSize = Math.max(5, Math.min(100, n));
        while (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    recordTurn(log: DebugTurnLog) {
        this.buffer.push(log);
        while (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
        this.notify();
    }

    getTurns(): DebugTurnLog[] {
        return [...this.buffer];
    }

    getTurn(index: number): DebugTurnLog | undefined {
        return this.buffer[index];
    }

    clear() {
        this.buffer = [];
        this.notify();
    }

    exportJson(): string {
        return JSON.stringify(this.buffer, null, 2);
    }

    subscribe(fn: () => void): () => void {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    private notify() {
        this.listeners.forEach((fn) => fn());
    }
}

export const turnLogger = new TurnLogger();
