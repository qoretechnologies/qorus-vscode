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
            >
                <Tab
                    id={'service'}
                    title={t('Service')}
                    className={'flex-column flex-auto'}
                    panel={<ServicesView service={initialData.service} />}
                />
                {<Tab id={'workflow'} title={t('Workflow')} panel={<WorkflowsView service={initialData.workflow} />} />}
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
            </Tabs>
        </Box>
    );
};

export default compose(
    withTextContext(),
    withInitialDataConsumer()
)(CreateInterface);
