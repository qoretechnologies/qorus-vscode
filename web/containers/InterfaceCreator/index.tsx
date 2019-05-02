import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { vscode } from '../../common/vscode';
import { Tabs, Tab } from '@blueprintjs/core';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import InterfaceCreatorPanel from './panel';
import Box, { BoxContent } from '../../components/Box';

export interface ICreateInterface {
    setTargetDir: (path: string) => Function;
    t: (text: string) => string;
    targetDir: string;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({ setTargetDir, t, targetDir }) => {
    const messageListener: (event: MessageEvent) => void = event => {
        switch (event.data.action) {
            case 'return-opening-path':
                setTargetDir(event.data.path);
                break;
        }
    };

    useEffectOnce(() => {
        window.addEventListener('message', messageListener);

        vscode.postMessage({
            action: 'get-opening-path',
        });

        return () => {
            window.removeEventListener('message', messageListener);
        };
    });

    /*if (!targetDir) {
        return null;
    }*/

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

const mapStateToProps = state => ({
    targetDir: state.create_iface_target_dir,
});

const mapDispatchToProps = dispatch => ({
    setTargetDir: targetDir =>
        dispatch({
            type: 'create_iface_target_dir',
            create_iface_target_dir: targetDir,
        }),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateInterface);
