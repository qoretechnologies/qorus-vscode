import React, { FunctionComponent, useState } from 'react';
import { ITreeNode, Tree, Icon } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import styled from 'styled-components';

export interface ITreeField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
    single?: boolean;
    useRelativePath?: boolean;
}

const StyledTreeWrapper = styled.div`
    height: 30px;
    line-height: 30px;
    padding-left: 7px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    .bp3-icon {
        color: #5c7080;
        margin-right: 5px;
    }
    &:hover {
        background-color: #dfe7f3;
    }
`;

const StyledTreeScroller = styled.div`
    max-height: 400px;
    overflow: auto;
`;

const TreeField: FunctionComponent<ITreeField & IField & IFieldChange> = ({
    get_message,
    return_message,
    addMessageListener,
    postMessage,
    onChange,
    name,
    value = [],
    single,
    useRelativePath,
}) => {
    const [isRootExpanded, setRootExpanded] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<string[]>([]);
    const [items, setItems] = useState<any>([]);

    useMount(() => {
        //
        postMessage(get_message.action, { object_type: get_message.object_type });
        addMessageListener(return_message.action, (data: any) => {
            // Check if this is the correct
            // object type
            if (!data.object_type || data.object_type === return_message.object_type) {
                setItems(data[return_message.return_value]);
            }
        });
    });

    const handleNodeClick: (node: ITreeNode<{ path: string; rel_path: string }>) => void = (node) => {
        // Which path should be used
        const usedPath: string = useRelativePath ? node.nodeData.rel_path : node.nodeData.path;
        // If we are dealing with single string
        if (single) {
            onChange(name, usedPath);
        } else {
            // Multiple files can be selected
            if (value.find((sel) => sel.name === usedPath)) {
                // Remove the selected item
                onChange(
                    name,
                    value.filter((path) => path.name !== usedPath)
                );
            } else {
                onChange(name, [...value, { name: usedPath }]);
            }
        }
    };

    const handleNodeCollapse: (node: ITreeNode<{ path: string }>) => void = (node) => {
        // Which path should be used
        const usedPath: string = useRelativePath ? node.nodeData.rel_path : node.nodeData.path;

        setExpanded((currentExpanded: string[]): string[] =>
            currentExpanded.filter((path: string) => path !== usedPath)
        );
    };

    const handleNodeExpand: (node: ITreeNode<{ path: string }>) => void = (node) => {
        // Which path should be used
        const usedPath: string = useRelativePath ? node.nodeData.rel_path : node.nodeData.path;

        setExpanded((currentExpanded: string[]): string[] => [...currentExpanded, usedPath]);
    };

    const transformItems: (data: any[]) => ITreeNode<{ path: string }>[] = (data) => {
        const result = data.reduce((newData, item, index): ITreeNode[] => {
            // Recursively build the child nodes (folders and files)
            const childNodes: any[] | undefined =
                size(item.dirs) + size(item.files) ? transformItems([...item.dirs, ...(item.files || [])]) : undefined;
            // Check if this item is a file
            const isFile: boolean = !('dirs' in item) && !('files' in item);
            // Build the absolute path
            const path: string = isFile
                ? `${useRelativePath ? item.rel_path : item.abs_path}/${item.name}`
                : useRelativePath
                ? item.rel_path
                : item.abs_path;
            const isExpanded = expanded.includes(useRelativePath ? item.rel_path : item.abs_path);
            // Return the transformed data
            return [
                ...newData,
                {
                    id: index,
                    depth: index,
                    hasCaret: !isFile && size(item.dirs) + size(item.files) !== 0,
                    isSelected: single ? value === path : value.find((sel) => sel.name === path),
                    icon: isFile ? 'document' : isExpanded ? 'folder-open' : 'folder-close',
                    isExpanded,
                    label: item.basename,
                    childNodes,
                    nodeData: {
                        path,
                        rel_path: item.rel_path,
                    },
                },
            ];
        }, []);

        return result;
    };

    return (
        <>
            <StyledTreeWrapper onClick={() => setRootExpanded((cur) => !cur)} name={`folder-expander-${name}`}>
                <Icon icon={isRootExpanded ? 'folder-open' : 'folder-close'} /> {isRootExpanded ? 'Hide' : 'Show'}{' '}
                folders{' '}
            </StyledTreeWrapper>
            <StyledTreeScroller>
                {isRootExpanded && (
                    <Tree
                        contents={transformItems(items)}
                        onNodeClick={handleNodeClick}
                        onNodeCollapse={handleNodeCollapse}
                        onNodeExpand={handleNodeExpand}
                    />
                )}
            </StyledTreeScroller>
        </>
    );
};

export default withMessageHandler()(TreeField);
