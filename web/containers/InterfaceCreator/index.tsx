import React, { FunctionComponent } from 'react';

import compose from 'recompose/compose';

import Box from '../../components/Box';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ClassConnectionsStateProvider from '../ClassConnectionsStateProvider';
import LibraryView from './libraryView';
import MapperView from './mapperView';
import InterfaceCreatorPanel from './panel';
import ServicesView from './servicesView';
import Tab from './tab';
import TypeView from './typeView';
import WorkflowsView, { CreatorWrapper } from './workflowsView';

export interface ICreateInterface {
    initialData: any;
    onSubmit: any;
}

export const CreateInterface: FunctionComponent<ICreateInterface> = ({ initialData, onSubmit }) => {
    return (
        <Box fill style={{ overflow: 'hidden' }}>
            <div className={'fullHeightTabs'}>
                <Tab type={initialData.subtab}>
                    {initialData.subtab === 'service' && (
                        <ServicesView service={initialData.service} onSubmitSuccess={onSubmit} />
                    )}
                    {initialData.subtab === 'mapper-code' && (
                        <LibraryView library={initialData.library} onSubmitSuccess={onSubmit} />
                    )}
                    {initialData.subtab === 'workflow' && (
                        <WorkflowsView workflow={initialData.workflow} onSubmitSuccess={onSubmit} />
                    )}
                    {initialData.subtab === 'job' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="job">
                                {classConnectionsProps => (
                                    <InterfaceCreatorPanel
                                        hasClassConnections
                                        hasConfigManager
                                        onSubmitSuccess={onSubmit}
                                        type={'job'}
                                        data={initialData.job}
                                        isEditing={!!initialData.job}
                                        {...classConnectionsProps}
                                    />
                                )}
                            </ClassConnectionsStateProvider>
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'class' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'class'}
                                data={initialData.class}
                                isEditing={!!initialData.class}
                                hasConfigManager
                                onSubmitSuccess={onSubmit}
                                definitionsOnly
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'step' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="step">
                                {classConnectionsProps => (
                                    <InterfaceCreatorPanel
                                        type={'step'}
                                        data={initialData.step}
                                        hasClassConnections
                                        hasConfigManager
                                        onSubmitSuccess={onSubmit}
                                        isEditing={!!initialData.step}
                                        onSubmit={
                                            initialData.stepCallback
                                                ? fields => {
                                                      const nameField = fields.find(field => field.name === 'name');
                                                      const versionField = fields.find(
                                                          field => field.name === 'version'
                                                      );
                                                      const typeField = fields.find(
                                                          field => field.name === 'base-class-name'
                                                      );
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
                                        {...classConnectionsProps}
                                    />
                                )}
                            </ClassConnectionsStateProvider>
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'mapper' && <MapperView onSubmitSuccess={onSubmit} />}
                    {initialData.subtab === 'other' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                onSubmitSuccess={onSubmit}
                                type={'other'}
                                data={initialData.other}
                                isEditing={!!initialData.other}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'type' && <TypeView onSubmitSuccess={onSubmit} />}
                </Tab>
            </div>
        </Box>
    );
};

export default compose(withTextContext(), withInitialDataConsumer())(CreateInterface);
