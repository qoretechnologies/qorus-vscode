import React, { Component } from 'react';
import { Button, Card, Collapse, Colors, Elevation, H3, H4, H5,
         Intent, Radio, RadioGroup, Spinner } from '@blueprintjs/core';
import {BackForwardButtons } from './BackForwardButtons';
import {SelectCommit } from './SelectCommit';
import { MessageDialog } from '../qorus_common/MessageDialog';
import logo from '../../images/qorus_logo_256.png';
const vscode = acquireVsCodeApi();


export class Root extends Component {
    constructor() {
        super();
        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-data':
                    this.setStates({branch: event.data.branch});
                    break;
                case 'return-diff':
                    this.setStates({
                        step: 1,
                        selected_commit: event.data.commit,
                        files: event.data.files,
                        pending: false
                    });
                    break;
                case 'return-text':
                    this.setStates({texts: Object.assign(this.state.texts || {},
                                                         {[event.data.text_id]: event.data.text})});
                    break;
                case 'package-created':
                    this.setStates({
                        step: 2,
                        tmp_files: event.data.tmp_files,
                        pending: false
                    });
                    break;
                case 'deployment-result':
                    this.setStates({step: 3,
                        result: event.data.result,
                        pending: false
                    });
                    break;
                case 'not-up-to-date':
                    this.setStates({
                        not_up_to_date_msg_open: true,
                        branch: event.data.branch,
                        pending: false
                    });
                    break;
            }
        });
    }

    componentWillMount() {
        const state = vscode.getState();
        if (state) {
            const {step, branch, release_type, selected_commit, files,
                   tmp_files, result, texts, not_up_to_date_msg_open, pending} = state;
            this.setState({step, branch, release_type, selected_commit, files,
                           tmp_files, result, texts, not_up_to_date_msg_open, pending});

            if (state.branch) {
                return;
            }
        }
        else {
            this.setStates({
                step: 0,
                branch: null,
                release_type: 'full',
                selected_commit: null,
                files: [],
                tmp_files: {},
                result: null,
                texts: {},
                not_up_to_date_msg_open: false,
                pending: false
            });
        }

        vscode.postMessage({
            action: 'get-data'
        });
    }

    t = (text_id) => {
        if (this.state && this.state.texts[text_id]) {
            return this.state.texts[text_id];
        }
        vscode.postMessage({
            action: 'get-text',
            text_id: text_id
        });
    }

    setVscodeState = state => {
        vscode.setState(Object.assign(vscode.getState() || {}, state));
    }

    setStates = state => {
        this.setVscodeState(state);
        this.setState(state);
    }

    onReleaseTypeChange = ev => {
        this.setStates({release_type: ev.target.value});
    }

    selectCommit = commit => {
        vscode.postMessage({
            action: 'get-diff',
            commit: commit
        });
        this.setStates({pending: true});
    }

    createPackage = () => {
        vscode.postMessage({
            action: 'create-package'
        });
        this.setStates({pending: true});
    }

    createFullPackage = () => {
        vscode.postMessage({
            action: 'create-full-package'
        });
        this.setStates({pending: true});
    }

    deployPackage = () => {
        vscode.postMessage({
            action: 'deploy-package'
        });
        this.setStates({pending: true});
    }

    backToStep = step => {
        switch (step) {
            case 0:
                this.setStates({step: step, files: []});
                break;
            case 1:
                this.setStates({step: step, tmp_files: {}});
                break;
            case 2:
                this.setStates({step: step});
                break;
        }
    }

    close = () => {
        vscode.postMessage({
            action: 'close'
        });
    }

    renderBranchInfo = () => {
        return (
            <div style={{ marginBottom: 24 }}>
                <H5>{this.t('CurrentBranchInfo')}:</H5>
                {this.t('branch')}: <strong>{this.state.branch.name}</strong>
                <br />
                {this.t('commit')}: <strong>{this.state.branch.commit}</strong>
            </div>
        );
    }

    renderNotUpToDateMsg = () => (
        <MessageDialog
            isOpen={this.state.not_up_to_date_msg_open}
            onClose={() => this.setState({not_up_to_date_msg_open: false})}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
            text={this.t('GitBranchNotUpToDate')}
            style={{maxWidth: 400}}
            buttons={[{
                title: this.t('ClosePage'),
                intent: Intent.DANGER,
                onClick: this.close
            }]}
        />
    );

    render() {
        if (!this.state.branch) {
            return null;
        }

        const header_style = {marginBottom: 24};

        return (
            <div className='flex-start'>
                {this.renderNotUpToDateMsg()}

                <img style={{ maxWidth: 36, maxHeight: 36, margin: '24px 0 0 12px' }} src={logo} />
                <Collapse isOpen={this.state.step == 0}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <div className='flex-start'>
                            <H4 style={{ marginRight: 48 }}>{this.t('ReleaseType')}:</H4>
                            <RadioGroup inline={true} onChange={this.onReleaseTypeChange} selectedValue={this.state.release_type}>
                                <Radio label={this.t('releaseTypeFull')} value='full' />
                                <Radio label={this.t('releaseTypeIncremental')} value='incremental' />
                            </RadioGroup>
                        </div>
                        <hr />
                        <Collapse isOpen={this.state.release_type == 'full'}>
                            <H3 style={header_style}>{this.t('FullRelease')}</H3>
                            {this.renderBranchInfo()}
                            <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-end'}} >
                                <Button icon={this.state.pending ? <Spinner size={18} /> : 'arrow-right'}
                                    onClick={this.createFullPackage}
                                    disabled={!this.state.branch.up_to_date || this.state.pending}
                                >
                                    {this.t('CreatePackage')}
                                </Button>
                            </div>
                        </Collapse>
                        <Collapse isOpen={this.state.release_type == 'incremental'}>
                            <H3 style={header_style}>{this.t('IncrementalRelease')}</H3>
                            {this.renderBranchInfo()}
                            <hr />
                            <SelectCommit
                                selectCommit={this.selectCommit}
                                vscode={vscode}
                                disabled={!this.state.branch.up_to_date || this.state.pending}
                                pending={this.state.pending}
                                t={this.t}
                            />
                        </Collapse>
                    </Card>
                </Collapse>
                <Collapse isOpen={this.state.step == 1}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <BackForwardButtons
                            onBack={() => this.backToStep(0)}
                            onForward={this.createPackage}
                            t={this.t}
                            forward_text={this.t('CreatePackage')}
                            disabled={this.state.pending}
                            pending={this.state.pending}
                        />
                        <H4 style={{marginTop: 12}}>{this.t('PackageContents')}</H4>
                        <H5>{this.t('SelectedCommit')}: <strong>{this.state.selected_commit}</strong></H5>
                        {this.state.files && this.state.files.map(file => <div>{file}</div>)}
                    </Card>
                </Collapse>
                <Collapse isOpen={this.state.step == 2}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <BackForwardButtons
                            onBack={() => this.backToStep(this.state.release_type == 'full' ? 0 : 1)}
                            onForward={this.deployPackage}
                            t={this.t}
                            forward_text={this.t('DeployPackage')}
                            pending={this.state.pending}
                        />
                        <H5>{this.t('FollowingReleaseFileWillBeSent')}:</H5>
                        <div>{this.state.tmp_files.path_tarbz2}</div>
                    </Card>
                </Collapse>
                <Collapse isOpen={this.state.step == 3}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <BackForwardButtons
                            onBack={() => this.backToStep(2)}
                            onClose={this.close}
                            t={this.t}
                        />
                        {this.state.result &&
                            <>
                                <H5>{this.t('WaitForDeploymentResult1')}</H5>
                                <div>{this.t('WaitForDeploymentResult2')}</div>
                            </>
                        }
                        {!this.state.result &&
                            <H5>{this.t('PackageDeploymentFailed')}</H5>
                        }
                    </Card>
                </Collapse>
            </div>
        );
    }
}
