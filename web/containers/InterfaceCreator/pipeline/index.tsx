import React, { useContext, useRef, useState } from 'react';

import filter from 'lodash/filter';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import { useDrop, XYCoord } from 'react-dnd';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';
import Tree from 'react-d3-tree';

import { Button, ButtonGroup, Callout, Intent, Tooltip } from '@blueprintjs/core';

import FileString from '../../../components/Field/fileString';
import String from '../../../components/Field/string';
import FieldLabel from '../../../components/FieldLabel';
import { Messages } from '../../../constants/messages';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../panel';
import FSMDiagramWrapper from './diagramWrapper';
import FSMState from './state';
import FSMStateDialog, { TAction } from './stateDialog';
import FSMToolbarItem from './toolbarItem';
import FSMTransitionDialog from './transitionDialog';
import { transformPipelineData } from '../../../helpers/pipeline';
import WorkflowStepDependencyParser from '../../../helpers/StepDependencyParser';

const stepsParser = new WorkflowStepDependencyParser();

export interface IPipelineViewProps {
    onSubmitSuccess: (data: any) => any;
    setFsmReset: () => void;
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
    elements: IPipelineElement[];
    options?: { [key: string]: any };
}

const StyledDiagramWrapper = styled.div<{ path: string }>`
    width: 100%;
    height: 100%;
    position: relative;
    background: ${({ path }) => `url(${`${path}/images/tiny_grid.png`})`};
`;

const PipelineView: React.FC<IPipelineViewProps> = () => {
    const wrapperRef = useRef(null);
    const t = useContext(TextContext);
    const { sidebarOpen, path, image_path, confirmAction, callBackend, pipeline } = useContext(InitialContext);
    const { resetAllInterfaceData } = useContext(GlobalContext);

    const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IPipelineMetadata>({
        target_dir: pipeline?.target_dir || null,
        name: pipeline?.name || null,
        desc: pipeline?.desc || null,
        elements: pipeline?.elements || [],
    });

    const handleMetadataChange: (name: string, value: any) => void = (name, value) => {
        setMetadata((cur) => ({
            ...cur,
            [name]: value,
        }));
    };

    const reset = () => {
        //setStates({});
        setMetadata({
            name: null,
            desc: null,
            target_dir: null,
            elements: pipeline?.elements || [],
        });
    };

    let testingData = [
        { type: 'mapper', name: 'MyMapper' },
        {
            type: 'queue',
            name: 'MyQueue1',
            children: [
                { type: 'processor', name: 'MyProcessor' },
                {
                    type: 'queue',
                    name: 'MyQueue1-1',
                    children: [
                        { type: 'mapper', name: 'MyMapper1-1-1' },
                        { type: 'processor', name: 'MyProcessor1-1-1' },
                    ],
                },
                {
                    type: 'queue',
                    name: 'MyQueue1-2',
                    children: [
                        { type: 'processor', name: 'MyProcessor1-2-1' },
                        {
                            type: 'queue',
                            name: 'MyQueue1-2-1',
                            children: [{ type: 'mapper', name: 'MyMapper1-2-1-1' }],
                        },
                    ],
                },
            ],
        },
        {
            type: 'queue',
            name: 'MyQueue1',
            children: [
                { type: 'processor', name: 'MyProcessor' },
                {
                    type: 'queue',
                    name: 'MyQueue1-1',
                    children: [
                        { type: 'mapper', name: 'MyMapper1-1-1' },
                        { type: 'processor', name: 'MyProcessor1-1-1' },
                    ],
                },
                {
                    type: 'queue',
                    name: 'MyQueue1-2',
                    children: [
                        { type: 'processor', name: 'MyProcessor1-2-1' },
                        {
                            type: 'queue',
                            name: 'MyQueue1-2-1',
                            children: [{ type: 'mapper', name: 'MyMapper1-2-1-1' }],
                        },
                    ],
                },
            ],
        },
    ];

    const getNodeShapeData = (type: string) => {
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
                        fill: '#fff',
                        stroke: '#a9a9a9',
                    },
                };
            case 'start':
                return {
                    shape: 'circle',
                    shapeProps: {
                        r: 25,
                        fill: '#d7d7d7',
                        stroke: '#a9a9a9',
                    },
                };
        }
    };

    const transformNodeData = (data, path) => {
        return data.reduce((newData, item, index) => {
            const newItem = { ...item };

            newItem.nodeSvgShape = getNodeShapeData(item.type);
            newItem.path = `${path}[${index}]`;

            if (item.children) {
                newItem.children = transformNodeData(newItem.children, `${newItem.path}.children`);
            }

            return [...newData, newItem];
        }, []);
    };

    testingData = transformNodeData([{ type: 'start', children: testingData }], '');

    console.log(testingData);

    return (
        <>
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
                    </>
                )}
            </div>
            <StyledDiagramWrapper ref={wrapperRef} id="pipeline-diagram" path={image_path}>
                {wrapperRef.current && (
                    <Tree
                        data={testingData}
                        orientation="vertical"
                        pathFunc="straight"
                        translate={{ x: wrapperRef.current.getBoundingClientRect().width / 2, y: 100 }}
                        nodeSize={{ x: 250, y: 250 }}
                        onClick={(nodeData) => console.log(nodeData)}
                        onLinkClick={(source, target) => console.log(source, target)}
                        textLayout={{
                            textAnchor: 'middle',
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
                            onClick={() => true}
                            disabled={true}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                        />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
        </>
    );
};

export default withGlobalOptionsConsumer()(PipelineView);
