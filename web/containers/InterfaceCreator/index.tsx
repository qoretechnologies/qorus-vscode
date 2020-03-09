import React, { FunctionComponent } from 'react';
import InterfaceCreatorPanel from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import ServicesView from './servicesView';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import WorkflowsView, { CreatorWrapper } from './workflowsView';
import Tab from './tab';
import MapperCreator from '../Mapper';
import MapperView from './mapperView';
import LibraryView from './libraryView';
import ClassConnectionsStateProvider from '../ClassConnectionsStateProvider';
import TypeView from './typeView';

export interface ICreateInterface {
    targetDir: string;
    t: TTranslator;
    initialData: any;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ initialData }) => {
    return (
        <Box fill style={{ overflow: 'hidden' }}>
            <div className={'fullHeightTabs'}>
                <Tab type={initialData.subtab}>
                    {initialData.subtab === 'service' && <ServicesView service={initialData.service} />}
                    {initialData.subtab === 'mapper-code' && <LibraryView library={initialData.library} />}
                    {initialData.subtab === 'workflow' && <WorkflowsView workflow={initialData.workflow} />}
                    {initialData.subtab === 'job' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="job">
                                {classConnectionsProps => (
                                    <InterfaceCreatorPanel
                                        hasClassConnections
                                        hasConfigManager
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
                    {initialData.subtab === 'mapper' && <MapperView />}
                    {initialData.subtab === 'other' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'other'}
                                data={initialData.other}
                                isEditing={!!initialData.other}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'type' && (
                        <TypeView />
                    )}
                </Tab>
            </div>
        </Box>
    );
};

export default compose(withTextContext(), withInitialDataConsumer())(CreateInterface);
