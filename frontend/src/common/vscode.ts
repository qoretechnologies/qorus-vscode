import { reduce, size } from 'lodash';
import { Messages } from '../constants/messages';
import configItems from '../stories/Data/configItems';
import directories from '../stories/Data/directories.json';
import fields from '../stories/Data/fields.json';
import items from '../stories/Data/interfaces.json';
import objects from '../stories/Data/objects.json';
import projectConfig from '../stories/Data/projectConfig.json';
import { sleep } from '../stories/Tests/utils';

export const username = 'IDETestUser';
export const password = 'wegkur-hegji7-woKnez';
export const basicAuthCredentials = `${username}:${password}`;
export const buildWsAuth = (token: string) =>
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'storybook'
    ? `?username=${username}&password=${password}`
    : `?token=${token}`;

export const vscode =
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'storybook'
    ? {
        postMessage: async (data) => {
          let messageData: any;

          switch (data.action) {
            case Messages.CONFIG_GET_DATA: {
              messageData = {
                action: Messages.CONFIG_RETURN_DATA,
                data: projectConfig,
              };

              break;
            }
            case 'open-window': {
              if (window) {
                window.open(data.url, '_blank');
              }

              break;
            }
            case 'get-all-text':
              messageData = {
                action: 'return-all-text',
                data: [],
              };
              break;
            case 'get-initial-data': {
              messageData = {
                action: 'return-initial-data',
                data: {
                  theme: 'dark',
                  qorus_instance: {
                    url: 'https://hq.qoretechnologies.com:8092',
                  },
                  is_hosted_instance: true,
                },
              };

              break;
            }
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
                data: data.type ? items[data.type] : items,
                request_id: data.request_id,
              };
              break;
            }
            case Messages.GET_ALL_INTERFACES_COUNT: {
              messageData = {
                action: `${Messages.GET_ALL_INTERFACES_COUNT}-complete`,
                data: reduce(
                  items,
                  (newItems, item, type) => ({
                    ...newItems,
                    [type]: {
                      items: size(items[type]),
                    },
                  }),
                  {}
                ),
                request_id: data.request_id,
              };
              break;
            }
            case 'get-latest-draft': {
              messageData = {
                action: 'get-latest-draft-complete',
                data: {},
                request_id: data.request_id,
              };
              break;
            }
            case 'get-drafts': {
              messageData = {
                action: 'get-drafts-complete',
                data: items[data.type].filter((item) => item.draft),
                request_id: data.request_id,
              };
              break;
            }
            case 'get-draft': {
              messageData = {
                action: 'get-draft-complete',
                request_id: data.request_id,
                data: {
                  date: '2023-12-31T15:42:54.462412+01:00',
                  type: 'fsm',
                  id: 'kJmIdKFwxXbUtGq523GyVm4291dXv4VsFCOuzSO4uPcQsRkL7n',
                  fsmData: {
                    metadata: {
                      name: 'issue-3563-pipeline-fsm',
                      desc: 'test',
                    },
                    states: {
                      '1': {
                        position: {
                          x: 73,
                          y: 32,
                        },
                        initial: true,
                        name: 'State 1',
                        desc: '',
                        type: 'state',
                        id: 'wkxqJVhIv',
                        action: {
                          type: 'pipeline',
                          value: 'issue-3563-pipeline',
                        },
                        execution_order: 1,
                      },
                    },
                  },
                  label: 'Unnamed Fsm',
                },
              };

              break;
            }
            case 'creator-get-directories': {
              messageData = {
                action: 'creator-return-directories',
                object_type: data.object_type,
              };

              switch (data.object_type) {
                case 'all_dirs': {
                  messageData = {
                    action: 'return-all-directories',
                    object_type: data.object_type,
                    directories,
                  };

                  break;
                }
                case 'target_dir': {
                  messageData.directories = directories;
                  break;
                }
              }

              break;
            }
            case 'creator-get-objects': {
              messageData = objects[data.object_type];

              // switch (data.object_type) {
              //   case 'mapper': {
              //     messageData.objects = [
              //       {
              //         name: 'Test Mapper 1',
              //         desc: 'Test Mapper 1 description',
              //         version: '1.0',
              //         type: 'mapper',
              //       },
              //     ];
              //     break;
              //   }
              //   case 'pipeline': {
              //     messageData.objects = [
              //       {
              //         name: 'Test Pipeline 1',
              //         desc: 'Test Pipeline 1 description',
              //         version: '1.0',
              //         type: 'pipeline',
              //       },
              //     ];
              //     break;
              //   }
              //   case 'fsm': {
              //     messageData.objects = [
              //       {
              //         name: 'Test FSM 1',
              //         type: 'fsm',
              //       },
              //     ];
              //     break;
              //   }
              //   case 'group': {
              //     messageData.objects = [
              //       {
              //         name: 'Test Group 1',
              //         type: 'group',
              //       },
              //     ];
              //     break;
              //   }
              //   case 'class-with-connectors': {
              //     messageData.objects = [
              //       {
              //         name: 'Test Class With Connectors 1',
              //         type: 'class',
              //         'class-connectors': [
              //           {
              //             name: 'Input Connector ',
              //             desc: 'Connector description',
              //             type: 'input',
              //           },
              //           {
              //             name: 'Ouptut Connector ',
              //             desc: 'Connector description',
              //             type: 'output',
              //           },
              //           {
              //             name: 'Input Output Connector ',
              //             desc: 'Connector description',
              //             type: 'input-output',
              //           },
              //           {
              //             name: 'Event Connector ',
              //             desc: 'Connector description',
              //             type: 'event',
              //           },
              //         ],
              //       },
              //     ];
              //     break;
              //   }
              // }

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
            case 'creator-get-resources': {
              if (data.object_type === 'files') {
                messageData = {
                  object_type: 'files',
                  action: 'creator-return-resources',
                };
              }
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
            case 'creator-get-fields': {
              messageData = fields[data.iface_kind];

              break;
            }
            case 'creator-get-fields-as-options': {
              messageData = {
                action: 'creator-get-fields-as-options-complete',
                request_id: data.request_id,
                ok: true,
                data: {
                  iface_kind: 'fsm',
                  fields: {
                    name: {
                      type: 'string',
                      display_name: 'Internal Name',
                      short_desc: 'The internal technical name of the flow',
                      desc: 'The internal technical name of the flow; it will be generated if not given',
                    },
                    display_name: {
                      type: 'string',
                      display_name: 'Name',
                      short_desc: 'The display name of the flow',
                      desc: 'The display name of the flow',
                      preselected: true,
                    },
                    short_desc: {
                      type: 'string',
                      display_name: 'Short Description',
                      short_desc: 'The short plain-text description of the flow',
                      desc: 'The short plain-text description of the flow',
                      preselected: true,
                    },
                    desc: {
                      type: 'string',
                      display_name: 'Description',
                      short_desc: 'The markdown description of the flow',
                      desc: 'The markdown description of the flow',
                    },
                    groups: {
                      type: 'multi-select',
                      display_name: 'Groups',
                      short_desc: 'Interface groups that the flow belongs to',
                      desc: 'Interface groups that the flow belongs to',
                      get_message: {
                        action: 'creator-get-objects',
                        object_type: 'group',
                        useWebSocket: true,
                      },
                      return_message: {
                        action: 'creator-return-objects',
                        object_type: 'group',
                        return_value: 'objects',
                        useWebSocket: true,
                      },
                    },
                    'input-type': {
                      type: 'data-provider',
                      display_name: 'Input Type',
                      short_desc: 'The input type for the flow',
                      desc: 'The input type for the flow',
                    },
                    'output-type': {
                      type: 'data-provider',
                      display_name: 'Output Type',
                      short_desc: 'The output type for the flow',
                      desc: 'The output type for the flow',
                    },
                  },
                },
              };
              break;
            }
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
