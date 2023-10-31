import useWebSocket from 'react-use-websocket';

export const useInternalWebSocket = (url: string) => {
  // If this environment supports websockets
  if (window.WebSocket) {
    return {
      ...useWebSocket(
        url,
        {
          share: true,
          heartbeat: true,
          onError: (e) => {
            console.log('Error', e);
          },
        },
        true
      ),
      isWebSocketSupported: true,
    };
  }

  return { isWebSocketSupported: false };
};
