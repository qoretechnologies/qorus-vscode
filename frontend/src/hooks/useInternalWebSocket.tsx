import useWebSocket, { Options } from 'react-use-websocket';

export const useInternalWebSocket = (url: string, options?: Options) => {
  // If this environment supports websockets
  if (window.WebSocket) {
    return {
      ...useWebSocket(
        url,
        {
          share: true,
          heartbeat: true,
          ...options,
        },
        true
      ),
      isWebSocketSupported: true,
    };
  }

  return undefined;
};
