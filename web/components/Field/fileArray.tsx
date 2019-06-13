import React, { FunctionComponent, useState, useEffect } from 'react';
import { ITreeNode, Tree } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import MultiSelect from './multiSelect';
import styled from 'styled-components';

export interface IMultiFileField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
}

const Spacer = styled.div`
    margin: 5px;
`;

const MultiFileField: FunctionComponent<IMultiFileField & IField & IFieldChange> = ({
    get_message,
    return_message,
    addMessageListener,
    postMessage,
    onChange,
    name,
    value = [],
    t,
}) => {
    const [expanded, setExpanded] = useState<string[]>([]);
    const [items, setItems] = useState<any>([
        {
            abs_path: '/home/martin/src/drei/sepl-it',
            rel_path: '.',
            files: [],
            dirs: [
                {
                    abs_path: '/home/martin/src/drei/sepl-it/src',
                    rel_path: 'src',
                    files: [
                        {
                            abs_path: '/home/martin/src/drei/sepl-it/src',
                            rel_path: 'src',
                            name: '.gitignore',
                        },
                    ],
                    dirs: [
                        {
                            abs_path: '/home/martin/src/drei/sepl-it/src/00-3SAT',
                            rel_path: 'src/00-3SAT',
                            files: [],
                            dirs: [
                                {
                                    abs_path: '/home/martin/src/drei/sepl-it/src/00-3SAT/isepl',
                                    rel_path: 'src/00-3SAT/isepl',
                                    files: [
                                        {
                                            abs_path: '/home/martin/src/drei/sepl-it/src/00-3SAT/isepl',
                                            rel_path: 'src/00-3SAT/isepl',
                                            name: 'it-00-tech_ass_transactions-3sat-in-v1.0.qjob',
                                        },
                                    ],
                                    dirs: [],
                                },
                            ],
                        },
                        {
                            abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL',
                            rel_path: 'src/00-DHL',
                            files: [],
                            dirs: [
                                {
                                    abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/isepl',
                                    rel_path: 'src/00-DHL/isepl',
                                    files: [
                                        {
                                            abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/isepl',
                                            rel_path: 'src/00-DHL/isepl',
                                            name: 'IT-00-DHL_DISPATCHER-IN-v1.0.qwf',
                                        },
                                        {
                                            abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/isepl',
                                            rel_path: 'src/00-DHL/isepl',
                                            name: 'it-00-dhl_dispatcher_create_wf-v1.0.qfd',
                                        },
                                    ],
                                    dirs: [],
                                },
                                {
                                    abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/msepl_at',
                                    rel_path: 'src/00-DHL/msepl_at',
                                    files: [
                                        {
                                            abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/msepl_at',
                                            rel_path: 'src/00-DHL/msepl_at',
                                            name: 'it-00-dhl_dispatcher-in-v1.0.qsd',
                                        },
                                        {
                                            abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/msepl_at',
                                            rel_path: 'src/00-DHL/msepl_at',
                                            name: 'it-00-dhl_dispatcher-in.qtest',
                                        },
                                    ],
                                    dirs: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ]);

    useMount(() => {
        //
        postMessage(get_message.action, { object_type: get_message.object_type });
        addMessageListener(return_message.action, (data: any) => {
            // Check if this is the correct
            // object type
            console.log(data.object_type, return_message.object_type);
            if (data.object_type === return_message.object_type) {
                setItems([
                    {
                        abs_path: '/home/martin/src/drei/sepl-it',
                        rel_path: '.',
                        files: [],
                        dirs: [
                            {
                                abs_path: '/home/martin/src/drei/sepl-it/src',
                                rel_path: 'src',
                                files: [
                                    {
                                        abs_path: '/home/martin/src/drei/sepl-it/src',
                                        rel_path: 'src',
                                        name: '.gitignore',
                                    },
                                ],
                                dirs: [
                                    {
                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-3SAT',
                                        rel_path: 'src/00-3SAT',
                                        files: [],
                                        dirs: [
                                            {
                                                abs_path: '/home/martin/src/drei/sepl-it/src/00-3SAT/isepl',
                                                rel_path: 'src/00-3SAT/isepl',
                                                files: [
                                                    {
                                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-3SAT/isepl',
                                                        rel_path: 'src/00-3SAT/isepl',
                                                        name: 'it-00-tech_ass_transactions-3sat-in-v1.0.qjob',
                                                    },
                                                ],
                                                dirs: [],
                                            },
                                        ],
                                    },
                                    {
                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL',
                                        rel_path: 'src/00-DHL',
                                        files: [],
                                        dirs: [
                                            {
                                                abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/isepl',
                                                rel_path: 'src/00-DHL/isepl',
                                                files: [
                                                    {
                                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/isepl',
                                                        rel_path: 'src/00-DHL/isepl',
                                                        name: 'IT-00-DHL_DISPATCHER-IN-v1.0.qwf',
                                                    },
                                                    {
                                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/isepl',
                                                        rel_path: 'src/00-DHL/isepl',
                                                        name: 'it-00-dhl_dispatcher_create_wf-v1.0.qfd',
                                                    },
                                                ],
                                                dirs: [],
                                            },
                                            {
                                                abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/msepl_at',
                                                rel_path: 'src/00-DHL/msepl_at',
                                                files: [
                                                    {
                                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/msepl_at',
                                                        rel_path: 'src/00-DHL/msepl_at',
                                                        name: 'it-00-dhl_dispatcher-in-v1.0.qsd',
                                                    },
                                                    {
                                                        abs_path: '/home/martin/src/drei/sepl-it/src/00-DHL/msepl_at',
                                                        rel_path: 'src/00-DHL/msepl_at',
                                                        name: 'it-00-dhl_dispatcher-in.qtest',
                                                    },
                                                ],
                                                dirs: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ]);
            }
        });
    });

    const handleSelectChange: (name: string, values: string[]) => void = (_name, values) => {
        onChange(name, values);
    };

    const handleNodeClick: (node: ITreeNode<{ path: string }>) => void = node => {
        if (value.find(sel => sel.name === node.nodeData.path)) {
            // Remove the selected item
            onChange(name, value.filter(path => path.name !== node.nodeData.path));
        } else {
            onChange(name, [...value, { name: node.nodeData.path }]);
        }
    };

    const handleNodeCollapse: (node: ITreeNode<{ path: string }>) => void = node => {
        setExpanded(
            (currentExpanded: string[]): string[] =>
                currentExpanded.filter((path: string) => path !== node.nodeData.path)
        );
    };

    const handleNodeExpand: (node: ITreeNode<{ path: string }>) => void = node => {
        setExpanded((currentExpanded: string[]): string[] => [...currentExpanded, node.nodeData.path]);
    };

    const transformItems: (data: any[]) => ITreeNode[] = data => {
        const result = data.reduce((newData, item, index): ITreeNode[] => {
            // Recursively build the child nodes (folders and files)
            const childNodes: any[] | undefined =
                size(item.dirs) + size(item.files) ? transformItems([...item.dirs, ...item.files]) : undefined;
            // Check if this item is a file
            const isFile: boolean = !('dirs' in item) && !('files' in item);
            // Build the absolute path
            const path: string = isFile ? `${item.abs_path}/${item.name}` : item.abs_path;
            // Return the transformed data
            return [
                ...newData,
                {
                    id: index,
                    depth: index,
                    hasCaret: !isFile,
                    isSelected: value.find(sel => sel.name === path),
                    icon: isFile ? 'document' : 'folder-close',
                    isExpanded: expanded.includes(item.abs_path),
                    label: isFile ? item.name : item.rel_path,
                    childNodes,
                    nodeData: {
                        path,
                    },
                },
            ];
        }, []);

        return result;
    };

    return (
        <>
            <MultiSelect simple name={'fileArraySelect'} onChange={handleSelectChange} value={value} />
            <Spacer />
            <Tree
                contents={transformItems(items)}
                onNodeClick={handleNodeClick}
                onNodeCollapse={handleNodeCollapse}
                onNodeExpand={handleNodeExpand}
            />
        </>
    );
};

export default withMessageHandler()(MultiFileField);
