import { useReqoreProperty } from '@qoretechnologies/reqore';
import { useContext, useRef } from 'react';
import useWebSocket, { Options } from 'react-use-websocket';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import shortid from 'shortid';
import { buildWsAuth } from '../common/vscode';
import { InitialContext } from '../context/init';
import { addMessageListener, postMessage } from '../hocomponents/withMessageHandler';

export interface IUseInternalWebSocket extends WebSocketHook {
  isWebSocketSupported: boolean;
}

export const useInternalWebSocket = (url: string, options?: Options) => {
  const { qorus_instance } = useContext(InitialContext);
  const ws = useRef<IUseInternalWebSocket>(null);
  const addNotification = useReqoreProperty('addNotification');

  console.log(qorus_instance);

  // If this environment supports websockets
  if (window.WebSocket) {
    ws.current = {
      ...useWebSocket(
        `${qorus_instance.url}/${url}${buildWsAuth(qorus_instance.token)}`,
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

  const post = (action: string, data: Record<string | number, any> = {}, useVsApi?: boolean) => {
    if (useVsApi) {
      postMessage(action, data);
    } else {
      ws.current?.sendJsonMessage({
        action,
        ...data,
      });
    }
  };

  const onMessage = (action: string, callback: (data: any) => any, useVsApi?: boolean) => {
    if (useVsApi) {
      return addMessageListener(action, callback);
    } else {
      const handleMessage = (event: MessageEvent) => {
        // Check if the action is equal
        if (event.data.action === action) {
          // Run the callback with the action data
          if (callback) {
            callback(event.data);
          }
        }
      };

      ws.current.getWebSocket().addEventListener('message', handleMessage);

      return () => {
        ws.current.getWebSocket().removeEventListener('message', handleMessage);
      };
    }
  };

  const callBackendBasic: (
    getMessage: string,
    returnMessage?: string,
    data?: any,
    toastMessage?: string
  ) => Promise<any> = async (getMessage, returnMessage, data, toastMessage) => {
    // Create the unique ID for this request
    const uniqueId: string = shortid.generate();
    // Create new toast
    if (toastMessage) {
      addNotification?.({
        content: toastMessage || 'Request in progress',
        intent: 'warning',
        duration: 30000,
        id: uniqueId,
      });
    }

    return new Promise((resolve, reject) => {
      // Create a timeout that will reject the request
      // after 2 minutes
      let timeout: NodeJS.Timer | null = setTimeout(() => {
        resolve({
          ok: false,
          message: 'Request timed out',
        });
      }, 300000);
      // Watch for the request to complete
      // if the ID matches then resolve
      const listener = onMessage(returnMessage || `${getMessage}-complete`, (data) => {
        if (data.request_id === uniqueId) {
          if (toastMessage) {
            addNotification?.({
              content: data.message || `Request ${getMessage} failed!`,
              intent: data.ok ? 'success' : 'danger',
              duration: 3000,
              id: uniqueId,
            });
          }

          clearTimeout(timeout);
          timeout = null;
          listener();
          resolve(data);
        }
      });

      // Fetch the data
      postMessage(getMessage, {
        request_id: uniqueId,
        ...data,
      });
    });
  };

  return {
    ...ws.current,
    postMessage: post,
    addMessageListener: onMessage,
    callBackendBasic,
    isReady: ws.current?.readyState === 1,
  };
};
