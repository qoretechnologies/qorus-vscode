import React, { FunctionComponent } from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import InterfaceCreatorPanel from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import ServicesView from './servicesView';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import WorkflowsView from './workflowsView';
import styled from 'styled-components';
import Content from '../../components/Content';
import MapperCreator from '../Mapper';

export interface ICreateInterface {
    targetDir: string;
    t: TTranslator;
    initialData: any;
}

const StyledTab = styled.div`
    display: flex;
    flex: 1;
`;

const CreateInterface: FunctionComponent<ICreateInterface> = ({ t, initialData }) => {
    return (
        <Box fill style={{ overflow: 'hidden' }}>
            <div className={'fullHeightTabs'}>
                {initialData.subtab === 'service' && (
                    <StyledTab>
                        <ServicesView service={initialData.service} />
                    </StyledTab>
                )}
                {initialData.subtab === 'workflow' && (
                    <StyledTab>
                        <WorkflowsView workflow={initialData.workflow} />
                    </StyledTab>
                )}
                {initialData.subtab === 'job' && (
                    <StyledTab>
                        <InterfaceCreatorPanel
                            hasConfigManager
                            type={'job'}
                            data={initialData.job}
                            isEditing={!!initialData.job}
                        />
                    </StyledTab>
                )}
                {initialData.subtab === 'class' && (
                    <StyledTab>
                        <InterfaceCreatorPanel
                            type={'class'}
                            data={initialData.class}
                            isEditing={!!initialData.class}
                            hasConfigManager
                        />
                    </StyledTab>
                )}
                {initialData.subtab === 'step' && (
                    <StyledTab>
                        <InterfaceCreatorPanel
                            type={'step'}
                            data={initialData.step}
                            hasConfigManager
                            isEditing={!!initialData.step}
                            onSubmit={
                                initialData.stepCallback
                                    ? fields => {
                                          const nameField = fields.find(field => field.name === 'name');
                                          const versionField = fields.find(field => field.name === 'version');
                                          const typeField = fields.find(field => field.name === 'base-class-name');
                                          initialData.stepCallback(
                                              nameField.value,
                                              versionField.value,
                                              typeField.value
                                          );
                                      }
                                    : null
                            }
                            openFileOnSubmit={!!!initialData.stepCallback}
                            forceSubmit
                        />
                    </StyledTab>
                )}
                {initialData.subtab === 'mapper' && (
                    <StyledTab>
                        <MapperCreator />
                    </StyledTab>
                )}
                {initialData.subtab === 'other' && (
                    <StyledTab>
                        <InterfaceCreatorPanel
                            type={'other'}
                            data={initialData.other}
                            isEditing={!!initialData.other}
                        />
                    </StyledTab>
                )}
            </div>
        </Box>
    );
};

export default compose(
    withTextContext(),
    withInitialDataConsumer()
)(CreateInterface);
