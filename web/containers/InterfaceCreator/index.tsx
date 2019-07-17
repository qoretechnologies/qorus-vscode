import React, { FunctionComponent, useState } from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import InterfaceCreatorPanel, { IField } from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import ServicesView from './servicesView';

export interface ICreateInterface {
    targetDir: string;
    t: TTranslator;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ t }) => {
    return (
        <Box fill>
            <Tabs id={'CreateInterfaceTabs'} renderActiveTabPanelOnly className={'fullHeightTabs'}>
                <Tab
                    id={'services'}
                    title={t('Services')}
                    className={'flex-column flex-auto'}
                    panel={<ServicesView />}
                />
                <Tab id={'workflows'} title={t('Workflows')} panel={<InterfaceCreatorPanel type={'workflow'} />} />
                <Tab id={'jobs'} title={t('Jobs')} panel={<InterfaceCreatorPanel type={'job'} />} />
            </Tabs>
        </Box>
    );
};

export default compose(withTextContext())(CreateInterface);
