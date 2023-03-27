import { vscode } from '../../src/common/vscode';
import { addMessageListener, postMessage } from '../../src/hocomponents/withMessageHandler';

// Mock vscode.postMessage
jest.mock('../../src/common/vscode', () => ({
  vscode: {
    postMessage: jest.fn(),
  },
}));

describe('addMessageListener', () => {
  test('should call the callback function when event action matches', () => {
    const callback = jest.fn();
    const action = 'SOME_ACTION';
    const messageEvent = {
      data: { action },
    };
    addMessageListener(action, callback);
    window.dispatchEvent(new MessageEvent('message', messageEvent));
    expect(callback).toHaveBeenCalledWith(messageEvent.data);
  });

  test('should not call the callback function when event action does not match', () => {
    const callback = jest.fn();
    const action = 'SOME_ACTION';
    const messageEvent = {
      data: { action: 'OTHER_ACTION' },
    };
    addMessageListener(action, callback);
    window.dispatchEvent(new MessageEvent('message', messageEvent));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('postMessage', () => {
  test('should call vscode.postMessage with correct parameters', () => {
    const action = 'SOME_ACTION';
    const data = { some: 'data' };
    vscode.postMessage = jest.fn();
    postMessage(action, data);
    expect(vscode.postMessage).toHaveBeenCalledWith({
      action,
      ...data,
    });
  });
});
