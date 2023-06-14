import configItems from '../stories/Data/configItems';
import items from '../stories/Data/interfaces.json';
import { sleep } from '../stories/Tests/utils';

export const username = 'IDETestUser';
export const password = 'wegkur-hegji7-woKnez';
export const basicAuthCredentials = `${username}:${password}`;

export const vscode =
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'storybook'
    ? {
        postMessage: async (data) => {
          let messageData: any;

          switch (data.action) {
            case 'fetch-data': {
              const { url, method, body, id } = data;

              const requestData = await fetch(
                `https://hq.qoretechnologies.com:8092/api/latest/${url}`,
                {
                  method,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${btoa(basicAuthCredentials)}`,
                  },
                  body: JSON.stringify(body),
                }
              );

              const json = await requestData.json();

              messageData = {
                action: 'fetch-data-complete',
                data: json,
                ok: requestData.ok,
                error: !requestData.ok ? json : undefined,
                id,
              };
              break;
            }
            case 'get-all-interfaces': {
              messageData = {
                action: 'get-all-interfaces-complete',
                data: items,
              };
              break;
            }
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
            case 'get-config-items': {
              await sleep(1000);

              messageData = {
                action: 'return-config-items',
                ...configItems,
              };
              break;
            }
            case 'get-config-items-custom-call': {
              await sleep(1000);

              messageData = {
                action: 'return-config-items',
                global_items: [],
                items: [
                  {
                    name: 'CFG',
                    default_value: 'test',
                    description: 'asg',
                    config_group: 1,
                    parent_data: {
                      name: 'CFG',
                      default_value: 'test',
                      description: 'asg',
                      config_group: 1,
                    },
                    parent: {
                      'interface-type': 'class',
                      'interface-name': 'ConfigItems',
                      'interface-version': '1',
                    },
                    parent_class: 'ConfigItems',
                    type: 'string',
                    value: 'test',
                    level: 'default',
                    is_set: true,
                    yamlData: {
                      value: 'test',
                      default_value: 'test',
                    },
                  },
                  {
                    name: 'CFG',
                    default_value: 'test',
                    description: 'asg',
                    config_group: 1,
                    parent_data: {
                      name: 'CFG',
                      default_value: 'test',
                      description: 'asg',
                      config_group: 1,
                    },
                    parent: {
                      'interface-type': 'class',
                      'interface-name': 'ConfigItems',
                      'interface-version': '1',
                    },
                    parent_class: 'ConfigItems',
                    type: 'string',
                    value: 'test',
                    level: 'default',
                    is_set: true,
                    yamlData: {
                      value: 'test',
                      default_value: 'test',
                    },
                  },
                  {
                    name: 'CFG',
                    default_value: 'test',
                    description: 'asg',
                    config_group: 1,
                    parent_data: {
                      name: 'CFG',
                      default_value: 'test',
                      description: 'asg',
                      config_group: 1,
                    },
                    parent: {
                      'interface-type': 'class',
                      'interface-name': 'ConfigItems',
                      'interface-version': '1',
                    },
                    parent_class: 'ConfigItems',
                    type: 'string',
                    value: 'test',
                    level: 'default',
                    is_set: true,
                    yamlData: {
                      value: 'test',
                      default_value: 'test',
                    },
                  },
                  {
                    name: 'CFG',
                    default_value: 'test',
                    description: 'asg',
                    config_group: 1,
                    parent_data: {
                      name: 'CFG',
                      default_value: 'test',
                      description: 'asg',
                      config_group: 1,
                    },
                    parent: {
                      'interface-type': 'class',
                      'interface-name': 'ConfigItems',
                      'interface-version': '1',
                    },
                    parent_class: 'ConfigItems',
                    type: 'string',
                    value: 'test',
                    level: 'default',
                    is_set: true,
                    yamlData: {
                      value: 'test',
                      default_value: 'test',
                    },
                  },
                ],
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
