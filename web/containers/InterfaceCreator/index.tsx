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

export interface ICreateInterface {
    targetDir: string;
    t: TTranslator;
    initialData: any;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ t, initialData }) => {
    return (
        <Box fill>
            <Tabs
                defaultSelectedTabId={initialData.subtab || 'service'}
                id={'CreateInterfaceTabs'}
                renderActiveTabPanelOnly
                className={'fullHeightTabs'}
                onChange={(newTabId: string): void => {
                    initialData.changeTab('CreateInterface', newTabId);
                }}
                selectedTabId={initialData.subtab}
            >
                <Tab
                    id={'service'}
                    title={t('Service')}
                    className={'flex-column flex-auto'}
                    panel={<ServicesView service={initialData.service} />}
                />
                {
                    <Tab
                        id={'workflow'}
                        title={t('Workflow')}
                        panel={<WorkflowsView workflow={initialData.workflow} />}
                    />
                }
                <Tab
                    id={'job'}
                    title={t('Job')}
                    panel={<InterfaceCreatorPanel type={'job'} data={initialData.job} isEditing={!!initialData.job} />}
                />
                <Tab
                    id={'class'}
                    title={t('Class')}
                    panel={
                        <InterfaceCreatorPanel
                            type={'class'}
                            data={initialData.class}
                            isEditing={!!initialData.class}
                        />
                    }
                />
                <Tab
                    id={'step'}
                    title={t('Step')}
                    panel={
                        <InterfaceCreatorPanel
                            type={'step'}
                            data={initialData.step}
                            isEditing={!!initialData.step}
                            onSubmit={
                                initialData.stepCallback
                                    ? fields => {
                                          const nameField = fields.find(field => field.name === 'name');
                                          const versionField = fields.find(field => field.name === 'version');
                                          const typeField = fields.find(field => field.name === 'base-class-name');
                                          initialData.stepCallback(
                                              `${nameField.value}:${versionField.value}`,
                                              typeField.value
                                          );
                                      }
                                    : null
                            }
                            openFileOnSubmit={!!!initialData.stepCallback}
                            forceSubmit
                        />
                    }
                />
            </Tabs>
        </Box>
    );
};

export default compose(
    withTextContext(),
    withInitialDataConsumer()
)(CreateInterface);
