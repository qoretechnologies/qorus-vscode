export const vscode =
  process.env.NODE_ENV === 'test'
    ? {
        postMessage: (data) => {
          let messageData;

          switch (data.action) {
            case 'get-interface-data': {
              let action = 'return-interface-data';

              if (data.request_id) {
                action += `-complete`;
              }

              messageData = {
                action,
                request_id: data.request_id,
                ok: true,
                data: {
                  iface_kind: data.iface_kind,
                  [data.iface_kind]: { name: 'Test Interface' },
                },
              };
              break;
            }
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
            case 'select-items':
              messageData = {
                action: 'select-items-response',
                testData: [
                  {
                    name: 'Item 1',
                    desc: 'Item 1 description',
                  },
                  {
                    name: 'Item 2',
                    desc: 'Item 2 description',
                  },
                  {
                    name: 'Item 3',
                    desc: 'Item 3 description',
                    filterMe: true,
                  },
                  {
                    name: 'Item 4',
                    desc: 'Item 4 description',
                  },
                ],
              };
              break;
            case 'select-processor-items':
              messageData = {
                action: 'select-processor-items-response',
                objects: [
                  {
                    name: 'Item 1',
                    desc: 'Item 1 description',
                  },
                  {
                    name: 'Item 2',
                    desc: 'Item 2 description',
                    object_type: 'processor-base-class',
                  },
                  {
                    name: 'Item 3',
                    desc: 'Item 3 description',
                  },
                  {
                    name: 'Item 4',
                    desc: 'Item 4 description',
                    object_type: 'processor-base-class',
                  },
                ],
              };
              break;
            case 'delete-draft': {
              messageData = {
                action: 'delete-draft-complete',
                request_id: data.request_id,
                data: data,
              };
              break;
            }
            default: {
              break;
            }
          }

          if (messageData) {
            window.postMessage(messageData, '*');
          }
        },
        setState: () => {},
        getState: () => {},
      }
    : acquireVsCodeApi();
