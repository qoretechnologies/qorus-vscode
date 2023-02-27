export const vscode =
  process.env.NODE_ENV === 'test'
    ? {
        postMessage: (data) => {
          let messageData;

          switch (data.action) {
            case 'string-test':
              messageData = {
                action: 'string-test-response',
                importantValue: '1234',
              };
              break;
            case 'number-test':
              messageData = {
                action: 'number-test-response',
                importantValue: 1234,
              };
              break;
          }

          window.postMessage(messageData, '*');
        },
        setState: () => {},
        getState: () => {},
      }
    : acquireVsCodeApi();
