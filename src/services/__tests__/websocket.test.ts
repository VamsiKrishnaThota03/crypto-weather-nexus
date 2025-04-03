import { websocketService } from '../websocket';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  onclose: (() => void) | null = null;
  close = jest.fn();

  constructor() {
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }
}

// Mock store
const mockStore = {
  dispatch: jest.fn(),
  getState: jest.fn(),
};

jest.mock('@/store', () => ({
  store: mockStore,
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('WebSocketService', () => {
  let originalWebSocket: typeof WebSocket;

  beforeAll(() => {
    originalWebSocket = global.WebSocket;
    (global as any).WebSocket = MockWebSocket;
  });

  afterAll(() => {
    (global as any).WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    websocketService.disconnect();
  });

  it('should connect to WebSocket', () => {
    websocketService.connect();
    expect(global.WebSocket).toHaveBeenCalledWith(
      'wss://ws.coincap.io/prices?assets=bitcoin,ethereum'
    );
  });

  it('should handle price updates', () => {
    const mockData = {
      bitcoin: 50000,
      ethereum: 3000,
    };

    websocketService.connect();
    const ws = new WebSocket('');

    if (ws.onmessage) {
      ws.onmessage({ data: JSON.stringify(mockData) });
    }

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'crypto/updateCryptoPrice',
        payload: { id: 'bitcoin', price: 50000 },
      })
    );

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'crypto/updateCryptoPrice',
        payload: { id: 'ethereum', price: 3000 },
      })
    );
  });

  it('should handle reconnection on error', () => {
    jest.useFakeTimers();
    websocketService.connect();
    const ws = new WebSocket('');

    if (ws.onerror) {
      ws.onerror(new Error('Connection error'));
    }

    jest.advanceTimersByTime(5000);
    expect(global.WebSocket).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('should handle reconnection on close', () => {
    jest.useFakeTimers();
    websocketService.connect();
    const ws = new WebSocket('');

    if (ws.onclose) {
      ws.onclose();
    }

    jest.advanceTimersByTime(5000);
    expect(global.WebSocket).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('should disconnect properly', () => {
    websocketService.connect();
    const ws = new WebSocket('');
    websocketService.disconnect();
    expect(ws.close).toHaveBeenCalled();
  });
}); 