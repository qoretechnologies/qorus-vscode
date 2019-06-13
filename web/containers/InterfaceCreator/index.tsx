import React, { FunctionComponent } from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import InterfaceCreatorPanel from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTargetDir from '../../hocomponents/withTargetDir';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';

export interface ICreateInterface {
    targetDir: string;
    t: TTranslator;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ t, targetDir }) => (
    <Box fill>
        <Tabs id={'CreateInterfaceTabs'} renderActiveTabPanelOnly className={'fullHeightTabs'}>
            <Tab
                id={'services'}
                title={t('Services')}
                className={'flex-column flex-auto'}
                panel={<InterfaceCreatorPanel type={'service'} />}
            />
            <Tab id={'workflows'} title={t('Workflows')} panel={<InterfaceCreatorPanel type={'workflow'} />} />
            <Tab id={'jobs'} title={t('Jobs')} panel={<InterfaceCreatorPanel />} />
        </Tabs>
    </Box>
);

export default compose(
    withTextContext(),
    withTargetDir()
)(CreateInterface);
