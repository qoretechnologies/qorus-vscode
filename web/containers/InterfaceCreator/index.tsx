import React, { FunctionComponent } from 'react';
import InterfaceCreatorPanel from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import ServicesView from './servicesView';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import WorkflowsView from './workflowsView';
import Tab from './tab';
import MapperCreator from '../Mapper';

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
                    {initialData.subtab === 'workflow' && <WorkflowsView workflow={initialData.workflow} />}
                    {initialData.subtab === 'job' && (
                        <InterfaceCreatorPanel
                            hasConfigManager
                            type={'job'}
                            data={initialData.job}
                            isEditing={!!initialData.job}
                        />
                    )}
                    {initialData.subtab === 'class' && (
                        <InterfaceCreatorPanel
                            type={'class'}
                            data={initialData.class}
                            isEditing={!!initialData.class}
                            hasConfigManager
                        />
                    )}
                    {initialData.subtab === 'step' && (
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
                    )}
                    {initialData.subtab === 'mapper' && <MapperCreator />}
                    {initialData.subtab === 'other' && (
                        <InterfaceCreatorPanel
                            type={'other'}
                            data={initialData.other}
                            isEditing={!!initialData.other}
                        />
                    )}
                </Tab>
            </div>
        </Box>
    );
};

export default compose(withTextContext(), withInitialDataConsumer())(CreateInterface);
