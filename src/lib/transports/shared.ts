const RECONNECT_DELAY = 2000;

export type ReconnectState = {
  reconnectCount: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  manualReconnect: boolean;
};

export const createReconnectState = (): ReconnectState => ({
  reconnectCount: 0,
  reconnectTimer: null,
  manualReconnect: false,
});

export const scheduleReconnect = (
  state: ReconnectState,
  connect: () => void,
  hasSubscribers: () => boolean,
) => {
  if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
  if (!hasSubscribers()) return;
  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null;
    state.reconnectCount++;
    connect();
  }, RECONNECT_DELAY);
};

export const cancelReconnect = (state: ReconnectState) => {
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }
};

export const manualReconnect = (
  state: ReconnectState,
  connect: () => void,
) => {
  state.manualReconnect = true;
  cancelReconnect(state);
  state.reconnectCount++;
  connect();
  state.manualReconnect = false;
};
