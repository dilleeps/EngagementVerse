import type { TranscriptMessage } from '@/types';

type EventType = 'transcript' | 'insight' | 'status' | 'error';
type EventHandler = (payload: unknown) => void;

const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<EventType, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private callId: string | null = null;
  private token: string | null = null;
  private intentionalClose = false;

  connect(callId: string, token?: string): void {
    this.callId = callId;
    this.token = token ?? null;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    this.openConnection();
  }

  private openConnection(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsBase =
      process.env.NEXT_PUBLIC_WS_URL ??
      (typeof window !== 'undefined'
        ? `ws://${window.location.host}`
        : 'ws://localhost:8000');

    let url = `${wsBase}/ws/calls/${this.callId}/transcript`;
    if (this.token) {
      url += `?token=${encodeURIComponent(this.token)}`;
    }
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as TranscriptMessage;
        const handlers = this.eventHandlers.get(data.type);
        if (handlers) {
          handlers.forEach((handler) => handler(data.payload));
        }
      } catch {
        // Ignore non-JSON frames
      }
    };

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect(): void {
    const backoff = Math.min(
      INITIAL_BACKOFF_MS * Math.pow(2, this.reconnectAttempts),
      MAX_BACKOFF_MS,
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.openConnection();
    }, backoff);
  }

  on(event: EventType, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: EventType, handler: EventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  onMessage(handler: (data: TranscriptMessage) => void): void {
    this.on('transcript', handler as EventHandler);
  }

  offMessage(handler: (data: TranscriptMessage) => void): void {
    this.off('transcript', handler as EventHandler);
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.eventHandlers.clear();
    this.ws?.close();
    this.ws = null;
    this.callId = null;
    this.token = null;
    this.reconnectAttempts = 0;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
