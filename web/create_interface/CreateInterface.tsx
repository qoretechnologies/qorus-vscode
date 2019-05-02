import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { vscode } from '../common/vscode';
import useEffectOnce from 'react-use/lib/useEffectOnce';

export interface ICreateInterface {
    setTargetDir: (path: string) => Function;
    t: (text: string) => string;
    targetDir: string;
}

const CreateInterface: FunctionComponent<ICreateInterface> = ({
    setTargetDir,
    t,
    targetDir,
}) => {
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

    if (!targetDir) {
        return null;
    }

    return (
        <div className="navbar-offset">
            {t('TargetDir')}: {targetDir}
        </div>
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

export const CreateInterfaceContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateInterface);
