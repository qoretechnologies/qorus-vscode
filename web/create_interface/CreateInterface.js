import React, { Component } from 'react';
import { connect } from 'react-redux';
import { vscode } from '../common/vscode';


class CreateInterface extends Component {
    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-opening-path':
                    this.props.setTargetDir(event.data.path);
                    break;
            }
        });
    }

    componentDidMount() {
        vscode.postMessage({
            action: 'get-opening-path'
        });
    }

    render() {
        if (!this.props.target_dir) {
            return null;
        }

        return (
            <div className='navbar-offset'>
                {this.props.t('TargetDir')}: {this.props.target_dir}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    target_dir: state.create_iface_target_dir
});

const mapDispatchToProps = dispatch => ({
    setTargetDir: target_dir => dispatch({type: 'create_iface_target_dir',
                                          create_iface_target_dir: target_dir})
});

export const CreateInterfaceContainer = connect(mapStateToProps, mapDispatchToProps)(CreateInterface);
