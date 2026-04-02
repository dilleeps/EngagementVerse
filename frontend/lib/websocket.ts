import type { TranscriptMessage } from '@/types';

type MessageHandler = (data: TranscriptMessage) => void;

const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private callId: string | null = null;
  private token: string | null = null;
  private intentionalClose = false;

  /**
   * Connect to the transcript WebSocket for a given call.
   */
  connect(callId: string, token: string): void {
    this.callId = callId;
    this.token = token;
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

    const url = `${wsBase}/ws/calls/${this.callId}/transcript?token=${encodeURIComponent(this.token ?? '')}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as TranscriptMessage;
        this.messageHandlers.forEach((handler) => handler(data));
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

  /**
   * Register a handler for incoming transcript messages.
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  /**
   * Remove a previously registered message handler.
   */
  offMessage(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Disconnect the WebSocket and stop reconnecting.
   */
  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.messageHandlers.clear();
    this.ws?.close();
    this.ws = null;
    this.callId = null;
    this.token = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Whether the WebSocket is currently connected.
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
