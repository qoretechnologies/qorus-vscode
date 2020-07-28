import React, { useContext, useRef, useState } from 'react';

import filter from 'lodash/filter';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import { useDrop, XYCoord } from 'react-dnd';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';

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

export interface IPipelineViewProps {
    onSubmitSuccess: (data: any) => any;
    setFsmReset: () => void;
}

export interface IPipelineProcessor {
    name: string;
    args?: { [key: string]: any };
}

export interface IPipelineMapper {
    name: string;
}

export interface IPipelineQueue {
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

const StyledDiagramWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`;

const PipelineView: React.FC<IPipelineViewProps> = () => {
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
            <StyledDiagramWrapper id="pipeline-diagram"></StyledDiagramWrapper>
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
