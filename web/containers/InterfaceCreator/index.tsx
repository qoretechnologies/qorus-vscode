import React, { FunctionComponent, useState } from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import InterfaceCreatorPanel, { IField } from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import ServicesView from './servicesView';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

export interface ICreateInterface {
    targetDir: string;
    t: TTranslator;
    initialData: any;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ t, initialData }) => {
    return (
        <Box fill>
            <Tabs
                defaultSelectedTabId={'services'}
                id={'CreateInterfaceTabs'}
                renderActiveTabPanelOnly
                className={'fullHeightTabs'}
            >
                <Tab
                    id={'services'}
                    title={t('Services')}
                    className={'flex-column flex-auto'}
                    panel={<ServicesView service={initialData.service} />}
                />
                <Tab
                    id={'workflows'}
                    title={t('Workflows')}
                    panel={<InterfaceCreatorPanel type={'workflow'} data={initialData.workflow} />}
                />
                <Tab
                    id={'jobs'}
                    title={t('Jobs')}
                    panel={<InterfaceCreatorPanel type={'job'} data={initialData.job} />}
                />
            </Tabs>
        </Box>
    );
};

export default compose(
    withTextContext(),
    withInitialDataConsumer()
)(CreateInterface);
