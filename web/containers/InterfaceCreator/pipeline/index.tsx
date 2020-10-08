import { Button, ButtonGroup, Classes, Intent, Tooltip } from '@blueprintjs/core';
import get from 'lodash/get';
import omit from 'lodash/omit';
import set from 'lodash/set';
import size from 'lodash/size';
import React, { useContext, useRef, useState } from 'react';
import Tree from 'react-d3-tree';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled from 'styled-components';
import ConnectorField from '../../../components/Field/connectors';
import FileString from '../../../components/Field/fileString';
import MultiSelect from '../../../components/Field/multiSelect';
import String from '../../../components/Field/string';
import Options from '../../../components/Field/systemOptions';
import FieldLabel from '../../../components/FieldLabel';
import { Messages } from '../../../constants/messages';
import { ContextMenuContext } from '../../../context/contextMenu';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import withMessageHandler, { TPostMessage } from '../../../hocomponents/withMessageHandler';
import { StyledToolbarWrapper } from '../fsm';
import { calculateFontSize } from '../fsm/state';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../panel';
import PipelineElementDialog from './elementDialog';

export interface IPipelineViewProps {
    onSubmitSuccess: (data: any) => any;
    setPipelineReset: (func: any) => void;
    postMessage: TPostMessage;
}

export interface IPipelineProcessor {
    type: string;
    name: string;
    args?: { [key: string]: any };
}

export interface IPipelineMapper {
    type: string;
    name: string;
}

export interface IPipelineQueue {
    type: string;
    name: string;
    elements: IPipelineElement[];
}

export type IPipelineElement = IPipelineQueue | IPipelineProcessor | IPipelineMapper;

export interface IPipelineMetadata {
    target_dir: string;
    name: string;
    desc: string;
    options?: { [key: string]: any };
    groups?: any;
    'input-provider': any;
    'input-provider-options': any;
}

const StyledDiagramWrapper = styled.div<{ path: string }>`
    width: 100%;
    height: 100%;
    position: relative;
    background: ${({ path }) => `url(${`${path}/images/tiny_grid.png`})`};
`;

const StyledNodeLabel = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;

    span {
        text-align: center;
    }
`;

const NodeLabel = ({ nodeData, onEditClick, onDeleteClick, onAddClick, onAddQueueClick }) => {
    const { addMenu } = useContext(ContextMenuContext);
    const t = useContext(TextContext);

    return (
        <StyledNodeLabel
            onClick={nodeData.type === 'start' ? undefined : () => onEditClick({ nodeData })}
            onContextMenu={(event) => {
                event.persist();

                let menu = { event, data: [] };

                if (nodeData.type !== 'start') {
                    menu.data.unshift({
                        item: t('Delete'),
                        onClick: () => onDeleteClick({ nodeData }),
                        icon: 'trash',
                        intent: 'danger',
                    });
                    menu.data.unshift({
                        item: t('Edit'),
                        onClick: () => onEditClick({ nodeData }),
                        icon: 'edit',
                        intent: 'warning',
                    });
                }

                const hasOnlyQueues = nodeData.children?.every((child) => child.type === 'queue');

                if (hasOnlyQueues) {
                    menu.data.unshift({
                        item: t('AddQueue'),
                        onClick: () =>
                            onAddQueueClick({
                                parentPath: nodeData.path,
                                name: null,
                                children: [],
                                _children: [],
                                type: 'queue',
                            }),
                        icon: 'add',
                        intent: 'none',
                    });
                } else if (!size(nodeData.children)) {
                    menu.data.unshift({
                        item: t('AddElement'),
                        onClick: () =>
                            onAddClick({
                                nodeData: { parentPath: nodeData.path },
                                parentData: nodeData,
                                onlyQueue: hasOnlyQueues,
                            }),
                        icon: 'add',
                        intent: 'none',
                    });
                }

                menu.data.unshift({
                    title: nodeData.name || t('Start'),
                });

                addMenu(menu);
            }}
        >
            <span style={{ fontSize: calculateFontSize(nodeData.name) }}>{nodeData.name}</span>
            {nodeData.type !== 'start' && (
                <span style={{ fontSize: calculateFontSize(nodeData.name, true) }} className={Classes.TEXT_MUTED}>
                    {nodeData.type}
                </span>
            )}
        </StyledNodeLabel>
    );
};

const PipelineView: React.FC<IPipelineViewProps> = ({ postMessage, setPipelineReset, onSubmitSuccess }) => {
    const wrapperRef = useRef(null);
    const t = useContext(TextContext);
    const { image_path, confirmAction, callBackend, pipeline } = useContext(InitialContext);
    const { resetAllInterfaceData } = useContext(GlobalContext);
    const changeHistory = useRef<string[]>([]);
    const currentHistoryPosition = useRef<number>(-1);

    useMount(() => {
        setPipelineReset(() => reset);

        updateHistory(
            transformNodeData(
                [
                    {
                        type: 'start',
                        children: pipeline?.children || [],
                    },
                ],
                ''
            )
        );

        return () => {
            setPipelineReset(null);
        };
    });

    const updateHistory = (data: IPipelineElement[]) => {
        if (currentHistoryPosition.current >= 0) {
            changeHistory.current.length = currentHistoryPosition.current + 1;
        }
        changeHistory.current.push(JSON.stringify(data));

        if (changeHistory.current.length > 10) {
            changeHistory.current.shift();
        } else {
            currentHistoryPosition.current += 1;
        }
    };

    const transformNodeData = (data, path) => {
        return data.reduce((newData, item, index) => {
            const newItem = { ...item };

            newItem.nodeSvgShape = getNodeShapeData(item.type, item.children);
            newItem.path = `${path}[${index}]`;

            if (item.children) {
                newItem.children = transformNodeData(newItem.children, `${newItem.path}.children`);
            }

            return [...newData, newItem];
        }, []);
    };

    const isDataValid = (data) => {
        return (
            data.reduce((isValid, item) => {
                if (item.type === 'queue' || item.type === 'start') {
                    if (item.children && item.children.length > 0) {
                        if (!isDataValid(item.children)) {
                            isValid = false;
                        }
                    } else {
                        isValid = false;
                    }
                }

                return isValid;
            }, true) &&
            validateField('string', metadata.name) &&
            validateField('string', metadata.desc) &&
            validateField('string', metadata.target_dir)
        );
    };

    const getNodeShapeData = (type: string, children: any[]) => {
        switch (type) {
            case 'mapper':
            case 'processor':
                return {
                    shape: 'rect',
                    shapeProps: {
                        width: '200px',
                        height: '60px',
                        x: -100,
                        y: -30,
                        fill: '#fff',
                        stroke: '#a9a9a9',
                    },
                };
            case 'queue':
                return {
                    shape: 'ellipse',
                    shapeProps: {
                        rx: 100,
                        ry: 30,
                        fill: children.length === 0 ? '#fddcd4' : '#fff',
                        stroke: children?.length === 0 ? '#d13913' : '#a9a9a9',
                    },
                };
            case 'start':
                return {
                    shape: 'circle',
                    shapeProps: {
                        r: 25,
                        fill: '#d7d7d7',
                        stroke: '#a9a9a9',
                        id: 'pipeline-start',
                    },
                };
        }
    };

    const [selectedElement, setSelectedElement] = useState<IPipelineElement | null>(null);
    const [interfaceId, setInterfaceId] = useState(pipeline?.iface_id || shortid.generate());
    const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IPipelineMetadata>({
        target_dir: pipeline?.target_dir || null,
        name: pipeline?.name || null,
        desc: pipeline?.desc || null,
        groups: pipeline?.groups || [],
        'input-provider': pipeline?.['input-provider'] || undefined,
        'input-provider-options': pipeline?.['input-provider-options'] || undefined,
    });
    const [elements, setElements] = useState<IPipelineElement[]>(
        transformNodeData(
            [
                {
                    type: 'start',
                    children: pipeline?.children || [],
                },
            ],
            ''
        )
    );

    const handleMetadataChange: (name: string, value: any) => void = (name, value) => {
        setMetadata((cur) => ({
            ...cur,
            [name]: value,
        }));
    };

    const handleSubmitClick = async () => {
        let fixedMetadata = { ...metadata };

        if (size(metadata.groups) === 0) {
            delete fixedMetadata.groups;
        }

        const result = await callBackend(
            pipeline ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
            undefined,
            {
                iface_kind: 'pipeline',
                iface_id: interfaceId,
                orig_data: pipeline,
                no_data_return: !!onSubmitSuccess,
                data: {
                    ...fixedMetadata,
                    'input-provider-options': metadata['input-provider-options'],
                    children: elements[0].children,
                },
            },
            t('Saving Pipeline...')
        );

        if (result.ok) {
            if (onSubmitSuccess) {
                onSubmitSuccess({
                    ...metadata,
                    'input-provider-options': metadata['input-provider-options'],
                    children: elements[0].children,
                });
            }
            reset();
            resetAllInterfaceData('pipeline');
        }
    };

    const reset = (hard?: boolean) => {
        postMessage(Messages.RESET_CONFIG_ITEMS, {
            iface_id: interfaceId,
        });

        setElements(
            transformNodeData(
                [
                    {
                        type: 'start',
                        children: hard ? [] : pipeline?.children || [],
                    },
                ],
                ''
            )
        );

        if (hard) {
            setMetadata({
                name: null,
                desc: null,
                target_dir: null,
                groups: [],
                'input-provider': null,
                'input-provider-options': null,
            });
        } else {
            setMetadata({
                name: pipeline?.name,
                desc: pipeline?.desc,
                target_dir: pipeline?.target_dir,
                groups: pipeline?.groups || [],
                'input-provider': pipeline?.['input-provider'],
                'input-provider-options': pipeline?.['input-provider-options'],
            });
        }
    };

    const handleDataSubmit = (data) => {
        setElements((cur) => {
            let result = [...cur];
            // We are adding a child to a queue
            if (data.parentPath) {
                const children = get(result, `${data.parentPath}.children`);
                if (!children) {
                    set(result, `${data.parentPath}.children`, [omit(data, ['parentPath'])]);
                } else {
                    // Push the new item
                    children.push(omit(data, ['parentPath']));
                }
            } else {
                set(result, data.path, data);
            }

            result = transformNodeData(result, '');

            updateHistory(result);

            return result;
        });
    };

    const filterRemovedElements = (data) =>
        data.reduce((newData, element) => {
            if (!element) {
                return newData;
            }
            if (element.children) {
                return [
                    ...newData,
                    {
                        ...element,
                        children: filterRemovedElements(element.children),
                    },
                ];
            }

            return [...newData, element];
        }, []);

    const removeElement = (elementData: IPipelineElement) => {
        setElements((cur) => {
            let result = [...cur];

            set(result, elementData.nodeData.path, undefined);

            result = filterRemovedElements(result);
            result = transformNodeData(result, '');

            updateHistory(result);

            return result;
        });
    };

    return (
        <>
            {selectedElement && (
                <PipelineElementDialog
                    data={selectedElement.nodeData}
                    parentData={selectedElement.parentData}
                    onlyQueue={selectedElement.onlyQueue}
                    onClose={() => setSelectedElement(null)}
                    onSubmit={handleDataSubmit}
                    inputProvider={metadata['input-provider']}
                    interfaceId={interfaceId}
                />
            )}
            <div id="pipeline-fields-wrapper">
                {!isMetadataHidden && (
                    <>
                        <FieldWrapper>
                            <FieldLabel
                                label={t('field-label-target_dir')}
                                isValid={validateField('file-string', metadata.target_dir)}
                            />
                            <FieldInputWrapper>
                                <FileString
                                    onChange={handleMetadataChange}
                                    name="target_dir"
                                    value={metadata.target_dir}
                                    get_message={{
                                        action: 'creator-get-directories',
                                        object_type: 'target_dir',
                                    }}
                                    return_message={{
                                        action: 'creator-return-directories',
                                        object_type: 'target_dir',
                                        return_value: 'directories',
                                    }}
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel
                                isValid={validateField('string', metadata.name)}
                                label={t('field-label-name')}
                            />
                            <FieldInputWrapper>
                                <String onChange={handleMetadataChange} value={metadata.name} name="name" />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel
                                isValid={validateField('string', metadata.desc)}
                                label={t('field-label-desc')}
                            />
                            <FieldInputWrapper>
                                <String onChange={handleMetadataChange} value={metadata.desc} name="desc" />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel
                                isValid={
                                    metadata.groups.length === 0 ? true : validateField('select-array', metadata.groups)
                                }
                                info={t('Optional')}
                                label={t('field-label-groups')}
                            />
                            <FieldInputWrapper>
                                <MultiSelect
                                    onChange={handleMetadataChange}
                                    get_message={{
                                        action: 'creator-get-objects',
                                        object_type: 'group',
                                    }}
                                    return_message={{
                                        action: 'creator-return-objects',
                                        object_type: 'group',
                                        return_value: 'objects',
                                    }}
                                    reference={{
                                        iface_kind: 'other',
                                        type: 'group',
                                    }}
                                    value={metadata.groups}
                                    name="groups"
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel
                                info={t('Optional')}
                                label={t('field-label-input-provider')}
                                isValid={
                                    metadata['input-provider']
                                        ? validateField('type-selector', metadata['input-provider'])
                                        : true
                                }
                            />
                            <FieldInputWrapper>
                                <ConnectorField
                                    value={metadata['input-provider']}
                                    isInitialEditing={!!pipeline}
                                    name="input-provider"
                                    onChange={handleMetadataChange}
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        {metadata['input-provider'] && (
                            <FieldWrapper>
                                <FieldLabel
                                    label={t('field-label-input-provider-options')}
                                    isValid={validateField('pipeline-options', metadata['input-provider-options'])}
                                />
                                <FieldInputWrapper>
                                    <Options
                                        value={metadata?.['input-provider-options']}
                                        onChange={handleMetadataChange}
                                        name="input-provider-options"
                                        url="/pipeline"
                                    />
                                </FieldInputWrapper>
                            </FieldWrapper>
                        )}
                    </>
                )}
            </div>
            <StyledToolbarWrapper id="pipeline-toolbar">
                <ButtonGroup style={{ float: 'right' }}>
                    <Button
                        onClick={() => {
                            currentHistoryPosition.current -= 1;
                            setElements(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
                        }}
                        disabled={currentHistoryPosition.current <= 0}
                        text={`(${currentHistoryPosition.current})`}
                        icon="undo"
                    />
                    <Button
                        onClick={() => {
                            currentHistoryPosition.current += 1;
                            setElements(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
                        }}
                        disabled={currentHistoryPosition.current === size(changeHistory.current) - 1}
                        text={`(${size(changeHistory.current) - (currentHistoryPosition.current + 1)})`}
                        icon="redo"
                    />
                    <Button
                        onClick={() => setIsMetadataHidden((cur) => !cur)}
                        icon={isMetadataHidden ? 'eye-open' : 'eye-off'}
                    />
                </ButtonGroup>
            </StyledToolbarWrapper>
            <StyledDiagramWrapper ref={wrapperRef} id="pipeline-diagram" path={image_path}>
                {wrapperRef.current && (
                    <Tree
                        data={elements}
                        orientation="vertical"
                        pathFunc="straight"
                        translate={{ x: wrapperRef.current.getBoundingClientRect().width / 2, y: 100 }}
                        nodeSize={{ x: 220, y: 110 }}
                        transitionDuration={0}
                        textLayout={{
                            textAnchor: 'middle',
                        }}
                        separation={{
                            siblings: 1,
                            nonSiblings: 1,
                        }}
                        allowForeignObjects
                        nodeLabelComponent={{
                            render: (
                                <NodeLabel
                                    onEditClick={setSelectedElement}
                                    onAddClick={setSelectedElement}
                                    onDeleteClick={(elementData) => removeElement(elementData)}
                                    onAddQueueClick={handleDataSubmit}
                                />
                            ),
                            foreignObjectWrapper: {
                                width: '200px',
                                height: '60px',
                                y: -30,
                                x: -100,
                            },
                        }}
                        collapsible={false}
                        styles={{
                            links: {
                                stroke: '#a9a9a9',
                                strokeWidth: 2,
                            },
                            nodes: {
                                node: {
                                    ellipse: {
                                        stroke: '#a9a9a9',
                                    },
                                    rect: {
                                        stroke: '#a9a9a9',
                                        rx: 25,
                                    },
                                    name: {
                                        stroke: '#333',
                                        strokeWidth: 0.8,
                                    },
                                },
                                leafNode: {
                                    ellipse: {
                                        stroke: '#a9a9a9',
                                    },
                                    rect: {
                                        stroke: '#a9a9a9',
                                        rx: 25,
                                    },
                                    name: {
                                        stroke: '#333',
                                        strokeWidth: 0.8,
                                    },
                                },
                            },
                        }}
                    />
                )}
            </StyledDiagramWrapper>
            <ActionsWrapper>
                <div style={{ float: 'right', width: '100%' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => {
                                    confirmAction(
                                        'ResetFieldsConfirm',
                                        () => {
                                            reset();
                                        },
                                        'Reset',
                                        'warning'
                                    );
                                }}
                            />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            onClick={handleSubmitClick}
                            disabled={!isDataValid(elements)}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                        />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
        </>
    );
};

export default compose(withGlobalOptionsConsumer(), withMessageHandler())(PipelineView);
