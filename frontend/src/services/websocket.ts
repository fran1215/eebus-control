type MessageHandler = (type: string, data: any) => void;

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000;
  private reconnectTimer: number | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private isIntentionallyClosed: boolean = false;

  constructor(url: string = 'ws://localhost:8080/ws') {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.isIntentionallyClosed = false;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handlers.forEach(handler => handler(message.type, message.data));
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }
    console.log(`Reconnecting in ${this.reconnectInterval}ms...`);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, data?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', type);
    }
  }

  // Request-response pattern with Promise
  async request<T = any>(type: string, data?: any, timeout: number = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeHandler(handler);
        reject(new Error(`Request timeout: ${type}`));
      }, timeout);

      const handler: MessageHandler = (msgType, msgData) => {
        // Match response to request based on type naming convention
        const responseTypes = this.getResponseTypes(type);
        if (responseTypes.includes(msgType)) {
          clearTimeout(timer);
          this.removeHandler(handler);
          
          if (msgType === 'error') {
            reject(new Error(msgData.error || 'Unknown error'));
          } else {
            resolve(msgData as T);
          }
        }
      };

      this.addHandler(handler);
      this.send(type, data);
    });
  }

  private getResponseTypes(requestType: string): string[] {
    const responseMap: Record<string, string[]> = {
      'get_local_ski': ['local_ski', 'error'],
      'get_remote_skis': ['remote_skis', 'error'],
      'register_ski': ['ski_registered', 'error'],
      'register_skis': ['skis_registered', 'error'],
      'get_lpp': ['lpp', 'error'],
      'get_lpc': ['lpc', 'error'],
      'get_log_level': ['log_level', 'error'],
      'set_log_level': ['log_level_changed', 'error'],
      'mdns_discovery': ['mdns_discovery', 'error'],
      'start_simulation': ['simulation_started', 'error'],
    };

    return responseMap[requestType] || ['error'];
  }

  // Listen for specific message types
  onMessage(messageType: string, callback: (data: any) => void) {
    const handler: MessageHandler = (type, data) => {
      if (type === messageType) {
        callback(data);
      }
    };
    this.addHandler(handler);
    return () => this.removeHandler(handler); // Return cleanup function
  }

  addHandler(handler: MessageHandler) {
    this.handlers.add(handler);
  }

  removeHandler(handler: MessageHandler) {
    this.handlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
