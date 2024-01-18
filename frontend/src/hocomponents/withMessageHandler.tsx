import { FunctionComponent } from 'react';
import { buildWsAuth, vscode } from '../common/vscode';

export const WS_RECONNECT_MAX_TRIES = 10;
export const isWebSocketSupported = 'WebSocket' in window;
export interface IWebSocketOptions {
  onOpen?: (ev: Event) => void;
  onClose?: (ev: CloseEvent) => void;
  onError?: (ev: Event) => void;
  onReconnecting?: (reconnectNumber?: number) => void;
  onReconnectFailed?: () => void;
}

export const wsConnections: Record<string, WebSocket> = {};
export const wsHeartbeats: Record<string, NodeJS.Timeout> = {};

export const createOrGetWebSocket = (instance: any, url: string, options: IWebSocketOptions) => {
  if (!instance) {
    throw new Error('Instance is not defined');
  }

  let isConnected = true;
  let reconnectTries = 0;
  let reconnectInterval: NodeJS.Timeout;

  function connect() {
    let wsUrl = instance.url.replace('http', 'ws');

    if (wsUrl.endsWith('/')) {
      wsUrl = wsUrl.slice(0, -1);
    }

    wsConnections[url] = new WebSocket(`${wsUrl}/${url}${buildWsAuth(instance.token)}`);

    wsConnections[url].onopen = function (this, ev) {
      reconnectTries = 0;
      isConnected = true;

      clearInterval(reconnectInterval);
      reconnectInterval = undefined;

      options?.onOpen?.(ev);

      startWebsocketHeartbeat(url);
    };

    wsConnections[url].onclose = function (this, ev) {
      options?.onClose?.(ev);

      removeWebSocketData(url);

      if (reconnectTries < WS_RECONNECT_MAX_TRIES) {
        reconnectTries++;
        reconnectInterval = setTimeout(() => {
          options.onReconnecting?.(reconnectTries);
          connect();
        }, 5000);
      } else {
        isConnected = false;
        reconnectInterval = undefined;
        reconnectTries = 0;

        options.onReconnectFailed?.();
      }
    };

    wsConnections[url].onerror = function (this, ev) {
      options?.onError?.(ev);

      removeWebSocketData(url);
    };
  }

  if (!wsConnections[url]) {
    connect();
  }
};

export const startWebsocketHeartbeat = (url: string) => {
  clearInterval(wsHeartbeats[url]);
  wsHeartbeats[url] = null;
  // Start the heartbeat
  wsHeartbeats[url] = setInterval(() => {
    if (!wsConnections[url]) {
      clearInterval(wsHeartbeats[url]);
      wsHeartbeats[url] = null;

      return;
    }

    wsConnections[url].send('ping');
  }, 3000);
};

export const disconnectWebSocket = (url: string) => {
  wsConnections[url]?.close();

  removeWebSocketData(url);
};

export const removeWebSocketData = (url: string) => {
  clearInterval(wsHeartbeats[url]);
  wsHeartbeats[url] = null;

  delete wsConnections[url];
  delete wsHeartbeats[url];
};

export type TPostMessage = (
  action?: string,
  data?: any,
  useWebSockets?: boolean,
  connection?: string
) => void;
export type TMessageListener = (
  action: string,
  callback: (data: any) => any,
  useWebSockets?: boolean,
  connection?: string,
  eventKey?: string
) => () => void;
export const addEventMessageListener: TMessageListener = (
  event,
  callback,
  useWebSockets,
  connection
) => {
  return addMessageListener(event, callback, useWebSockets, connection, 'event');
};

// Adds a new message listener
export const addMessageListener: TMessageListener = (
  action,
  callback,
  useWebSockets?: boolean,
  connection = 'creator',
  eventKey: string = 'action'
) => {
  // Check if websockets are supported
  // @ts-ignore
  const useWs =
    isWebSocketSupported &&
    useWebSockets &&
    // @ts-ignore
    (process.env.NODE_ENV === 'storybook' ? window._useWebsocketsInStorybook : true) &&
    process.env.NODE_ENV !== 'test';

  // Check if websockets are supported
  if (useWs && !wsConnections[connection]) {
    console.error(`Connection ${connection} does not exist`);

    return () => void null;
  }

  // Register the listener
  const messageListener = (event: MessageEvent) => {
    if (event.data === 'ping' || event.data === 'pong') {
      return;
    }

    const _data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    // Check if the action is equal
    if (_data[eventKey] === action) {
      // Run the callback with the action data
      if (callback) {
        callback(_data);
      }
    }
  };

  const handler = useWs ? wsConnections[connection] : window;

  handler.addEventListener('message', messageListener);

  return () => {
    handler.removeEventListener('message', messageListener);
  };
};

// Send message
export const postMessage: TPostMessage = (
  action,
  data = {},
  useWebSockets,
  connection = 'creator'
) => {
  const useWs =
    isWebSocketSupported &&
    useWebSockets &&
    // @ts-ignore
    (process.env.NODE_ENV === 'storybook' ? window._useWebsocketsInStorybook : true) &&
    process.env.NODE_ENV !== 'test';

  if (useWs) {
    if (!wsConnections[connection]) {
      console.error(`Connection ${connection} does not exist`);
      return;
    }

    wsConnections[connection].send(
      JSON.stringify({
        action,
        ...data,
      })
    );

    return;
  }

  vscode.postMessage?.({
    action,
    ...data,
  });
};

// A HoC helper to register & action vscode events
export default () =>
  (Component: FunctionComponent): FunctionComponent => {
    const enhancedComponent: FunctionComponent = (props: any) => {
      // Return the enhanced component
      return (
        <Component {...props} addMessageListener={addMessageListener} postMessage={postMessage} />
      );
    };

    return enhancedComponent;
  };
