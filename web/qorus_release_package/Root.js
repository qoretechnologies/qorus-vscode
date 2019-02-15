import React, { Component } from 'react';
import { Button, Card, Collapse, Colors, Elevation, H3, H4, H5,
         Intent, Radio, RadioGroup, Spinner } from '@blueprintjs/core';
import {BackForwardButtons } from './BackForwardButtons';
import {SelectCommit } from './SelectCommit';
import { MessageDialog } from '../qorus_common/MessageDialog';
import logo from '../../images/qorus_logo_256.png';
const vscode = acquireVsCodeApi();


const Step = {Type: 0, Diff: 1, Send: 2, Close: 3}

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
                        step: Step.Diff,
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
                case 'return-release-file':
                    this.setStates({
                        step: Step.Send,
                        package_path: event.data.package_path,
                        pending: false
                    });
                    break;
                case 'deployment-result':
                    this.setStates({step: Step.Close,
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
                   package_path, result, texts, not_up_to_date_msg_open, pending} = state;
            this.setState({step, branch, release_type, selected_commit, files,
                           package_path, result, texts, not_up_to_date_msg_open, pending});

            if (state.branch) {
                return;
            }
        }
        else {
            this.setStates({
                step: Step.Type,
                branch: null,
                release_type: 'full',
                selected_commit: null,
                files: [],
                package_path: null,
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

    getReleaseFile = () => {
        vscode.postMessage({
            action: 'get-release-file'
        });
        this.setStates({pending: true});
    }

    backToStep = step => {
        switch (step) {
            case Step.Type:
                this.setStates({step: step, files: [], package_path: null});
                break;
            case Step.Diff:
                this.setStates({step: step, package_path: null});
                break;
            case Step.Send:
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

                <Collapse isOpen={this.state.step == Step.Type}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <div className='flex-start'>
                            <H4 style={{ marginRight: 48 }}>{this.t('ReleaseType')}:</H4>
                            <RadioGroup onChange={this.onReleaseTypeChange} selectedValue={this.state.release_type}>
                                <Radio label={this.t('CreateFullRelease')} value='full' />
                                <Radio label={this.t('CreateIncrementalRelease')} value='incremental' />
                                <Radio label={this.t('UseExistingRelease')} value='existing' />
                            </RadioGroup>
                        </div>
                        <hr style={{marginBottom: 16}} />
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
                        <Collapse isOpen={this.state.release_type == 'existing'} className='flex-center'>
                            <Button icon='folder-open' onClick={this.getReleaseFile}>
                                {this.t('PickReleaseFile')}
                            </Button>
                        </Collapse>
                    </Card>
                </Collapse>

                <Collapse isOpen={this.state.step == Step.Diff}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <BackForwardButtons
                            onBack={() => this.backToStep(Step.Type)}
                            onForward={this.createPackage}
                            t={this.t}
                            forward_text_id='CreatePackage'
                            disabled={this.state.pending}
                            pending={this.state.pending}
                        />
                        <H4 style={{marginTop: 12}}>{this.t('PackageContents')}</H4>
                        <H5>{this.t('SelectedCommit')}: <strong>{this.state.selected_commit}</strong></H5>
                        {this.state.files && this.state.files.map(file => <div>{file}</div>)}
                    </Card>
                </Collapse>

                <Collapse isOpen={this.state.step == Step.Send}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <BackForwardButtons
                            onBack={() => this.backToStep(this.state.release_type == 'incremental' ?
                                                                Step.Diff : Step.Type)}
                            onForward={this.deployPackage}
                            t={this.t}
                            forward_text_id='DeployPackage'
                            pending={this.state.pending}
                        />
                        <H5>{this.t(this.state.release_type == 'existing'
                                ? 'ExistingReleaseFileWillBeSent'
                                : 'NewReleaseFileWillBeSent'
                             )}:
                        </H5>
                        <div>{this.state.package_path}</div>
                    </Card>
                </Collapse>

                <Collapse isOpen={this.state.step == Step.Close}>
                    <Card className='card' elevation={Elevation.TWO}>
                        <BackForwardButtons
                            onBack={() => this.backToStep(Step.Send)}
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
