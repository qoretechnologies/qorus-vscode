import { Button, ButtonGroup, Callout, Icon, Intent, ITreeNode, Tree } from '@blueprintjs/core';
import { size } from 'lodash';
import React, { FunctionComponent, useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';
import Field, { IField } from '.';
import { TTranslator } from '../../App';
import {
    ActionsWrapper,
    ContentWrapper,
    FieldInputWrapper,
    FieldWrapper,
    IFieldChange,
} from '../../containers/InterfaceCreator/panel';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import Content from '../Content';
import CustomDialog from '../CustomDialog';
import FieldLabel from '../FieldLabel';

export interface ITreeField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
    single?: boolean;
    useRelativePath?: boolean;
    notFixed?: boolean;
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
    notFixed,
}) => {
    const t = useContext(TextContext);
    const { callBackend } = useContext(InitialContext);
    const [isRootExpanded, setRootExpanded] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<string[]>([]);
    const [items, setItems] = useState<any>([]);
    const [folderDialog, setFolderDialog] = useState<any>(undefined);

    useMount(() => {
        addMessageListener(return_message.action, (data: any) => {
            // Check if this is the correct
            // object type
            if (!data.object_type || data.object_type === return_message.object_type) {
                setItems(data[return_message.return_value]);
            }
        });
        postMessage(get_message.action, { object_type: get_message.object_type });
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

    const handleCreateDirSubmit = async (addSource?: boolean) => {
        setFolderDialog({ ...folderDialog, loading: true });

        const data = await callBackend('create-directory', {
            path: `${folderDialog.abs_path}${
                folderDialog.newPath.startsWith('/') ? folderDialog.newPath : `/${folderDialog.newPath}`
            }`,
            add_source: addSource,
        });

        if (data.ok) {
            setFolderDialog(undefined);
            postMessage(get_message.action, { object_type: get_message.object_type });
        } else {
            setFolderDialog((cur) => ({
                ...cur,
                loading: false,
                error: data.message,
            }));
        }
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
                    secondaryLabel: isFile ? undefined : (
                        <Icon
                            icon="folder-new"
                            intent="success"
                            style={{ cursor: 'pointer' }}
                            onClick={(event) => {
                                event.stopPropagation();
                                setFolderDialog({ ...item, newPath: '/' });
                            }}
                        />
                    ),
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
            {folderDialog && (
                <CustomDialog
                    icon="folder-new"
                    isOpen
                    title={t('CreateNewDir')}
                    onClose={() => {
                        setFolderDialog(undefined);
                    }}
                    style={{ maxWidth: '70vw', paddingBottom: 0 }}
                >
                    <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                        <Callout intent="primary">
                            {t('AddingNewDirectoryTo')} <strong>{folderDialog.abs_path}</strong>.{' '}
                            {t('MultipleSubdirectoriesNewDir')}
                        </Callout>
                        {folderDialog.error && <Callout intent="danger">{folderDialog.error}</Callout>}
                        <ContentWrapper>
                            <FieldWrapper padded>
                                <FieldLabel
                                    label={t('field-label-newDir')}
                                    isValid={validateField('string', folderDialog.newPath)}
                                />
                                <FieldInputWrapper>
                                    <Field
                                        type="string"
                                        value={folderDialog.newPath}
                                        onChange={(name, value) =>
                                            setFolderDialog((cur) => ({ ...cur, [name]: value }))
                                        }
                                        name="newPath"
                                    />
                                </FieldInputWrapper>
                            </FieldWrapper>
                        </ContentWrapper>
                        <ActionsWrapper style={{ padding: '10px' }}>
                            <ButtonGroup fill>
                                <Button
                                    text={t('CreateFolder')}
                                    disabled={!validateField('string', folderDialog.newPath)}
                                    icon={'tick'}
                                    name={`submit-new-folder`}
                                    intent={Intent.SUCCESS}
                                    onClick={() => handleCreateDirSubmit()}
                                    loading={folderDialog.loading}
                                />
                                <Button
                                    text={t('CreateFolderAndAddSource')}
                                    disabled={!validateField('string', folderDialog.newPath)}
                                    icon={'tick'}
                                    name={`submit-new-folder`}
                                    intent={Intent.SUCCESS}
                                    onClick={() => handleCreateDirSubmit(true)}
                                    loading={folderDialog.loading}
                                />
                            </ButtonGroup>
                        </ActionsWrapper>
                    </Content>
                </CustomDialog>
            )}
            <StyledTreeWrapper onClick={() => setRootExpanded((cur) => !cur)} name={`folder-expander-${name}`}>
                <Icon icon={isRootExpanded ? 'folder-open' : 'folder-close'} /> {isRootExpanded ? 'Hide' : 'Show'}{' '}
                folders{' '}
            </StyledTreeWrapper>
            {notFixed ? (
                <>
                    {isRootExpanded && (
                        <Tree
                            contents={transformItems(items)}
                            onNodeClick={handleNodeClick}
                            onNodeCollapse={handleNodeCollapse}
                            onNodeExpand={handleNodeExpand}
                        />
                    )}
                </>
            ) : (
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
            )}
        </>
    );
};

export default withMessageHandler()(TreeField);
