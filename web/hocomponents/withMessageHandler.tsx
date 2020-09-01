import React, { FunctionComponent } from 'react';
import { vscode } from '../common/vscode';
import { Messages } from '../constants/messages';

export type TPostMessage = (action: string, data?: any) => void;
export type TMessageListener = (action: string, callback: (data: any) => any) => () => void;
// Adds a new message listener
export const addMessageListener: TMessageListener = (action, callback) => {
    // Register the listener
    const messageListener = (event: MessageEvent) => {
        // Check if the action is equal
        if (event.data.action === action) {
            // Run the callback with the action data
            if (callback) {
                callback(event.data);
            }
        }
    };

    window.addEventListener('message', messageListener);

    return () => {
        window.removeEventListener('message', messageListener);
    };
};

// Send message
export const postMessage: TPostMessage = (action, data = {}) => {
    vscode.postMessage({
        action,
        ...data,
    });
};

// A HoC helper to register & action vscode events
export default () => (Component: FunctionComponent): FunctionComponent => {
    const enhancedComponent: FunctionComponent = (props: any) => {
        // Return the enhanced component
        return <Component {...props} addMessageListener={addMessageListener} postMessage={postMessage} />;
    };

    return enhancedComponent;
};
