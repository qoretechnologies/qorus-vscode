import React, { FunctionComponent } from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import InterfaceCreatorPanel from './panel';
import Box from '../../components/Box';
import compose from 'recompose/compose';
import withTargetDir from '../../hocomponents/withTargetDir';

export interface ICreateInterface {
    setTargetDir: (path: string) => Function;
    t: (text: string) => string;
    targetDir: string;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ t, targetDir }) => {
    /*if (!targetDir) {
        return null;
    }*/

    console.log(targetDir);

    return (
        <Box>
            <Tabs id="CreateInterfaceTabs" renderActiveTabPanelOnly>
                <Tab id="workflows" title={t('Workflows')} panel={<InterfaceCreatorPanel />} />
                <Tab id="services" title={t('Services')} panel={<InterfaceCreatorPanel />} />
                <Tab id="jobs" title={t('Jobs')} panel={<InterfaceCreatorPanel />} />
            </Tabs>
        </Box>
    );
};

export default compose(withTargetDir())(CreateInterface);
