export const vscode =
  process.env.NODE_ENV === 'test'
    ? {
        postMessage: (data) => {
          let messageData: any;

          switch (data.action) {
            case 'creator-get-objects': {
              messageData = {
                action: 'creator-return-objects',
                object_type: data.object_type,
              };

              switch (data.object_type) {
                case 'mapper': {
                  messageData.objects = [
                    {
                      name: 'Test Mapper 1',
                      desc: 'Test Mapper 1 description',
                      version: '1.0',
                      type: 'mapper',
                    },
                  ];
                  break;
                }
                case 'pipeline': {
                  messageData.objects = [
                    {
                      name: 'Test Pipeline 1',
                      desc: 'Test Pipeline 1 description',
                      version: '1.0',
                      type: 'pipeline',
                    },
                  ];
                  break;
                }
                case 'fsm': {
                  messageData.objects = [
                    {
                      name: 'Test FSM 1',
                      type: 'fsm',
                    },
                  ];
                  break;
                }
                case 'group': {
                  messageData.objects = [
                    {
                      name: 'Test Group 1',
                      type: 'group',
                    },
                  ];
                  break;
                }
                case 'class-with-connectors': {
                  messageData.objects = [
                    {
                      name: 'Test Class With Connectors 1',
                      type: 'class',
                      'class-connectors': [
                        {
                          name: 'Input Connector ',
                          desc: 'Connector description',
                          type: 'input',
                        },
                        {
                          name: 'Ouptut Connector ',
                          desc: 'Connector description',
                          type: 'output',
                        },
                        {
                          name: 'Input Output Connector ',
                          desc: 'Connector description',
                          type: 'input-output',
                        },
                        {
                          name: 'Event Connector ',
                          desc: 'Connector description',
                          type: 'event',
                        },
                      ],
                    },
                  ];
                  break;
                }
              }

              break;
            }
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