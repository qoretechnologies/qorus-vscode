import React, { Component } from 'react';
import { Button, Card, Collapse, H3, H4, H5, Intent, Radio, RadioGroup, Spinner } from '@blueprintjs/core';
import { BackForwardButtons } from './BackForwardButtons';
import { SelectCommit } from './SelectCommit';
import { MessageDialog } from '../common/MessageDialog';
import { vscode } from '../common/vscode';
import logo from '../../images/qorus_logo_256.png';


const Step = {Type: 0, Diff: 1, Send: 2, Close: 3}

export class Root extends Component {
    constructor() {
        super();

        this.texts = {};
        this.num_text_requests = 0;

        const state = vscode.getState();
        if (state) {
            const {step, branch, release_type, selected_commit, files, package_path,
                   saved_path, result, not_up_to_date_msg_open, pending} = state;
            this.state = {step, branch, release_type, selected_commit, files, package_path,
                          saved_path, result, not_up_to_date_msg_open, pending};
        }
        else {
            this.state = {
                step: Step.Type,
                branch: null,
                release_type: 'full',
                selected_commit: null,
                files: [],
                package_path: null,
                saved_path: null,
                result: null,
                not_up_to_date_msg_open: false,
                pending: false
            };
            this.setVscodeState(this.state);
        }

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
                    this.texts[event.data.text_id] = event.data.text;
                    if (--this.num_text_requests == 0) {
                        this.forceUpdate();
                    }
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
                case 'release-file-saved':
                    this.setStates({
                        saved_path: event.data.saved_path
                    });
                    break;
            }
        });
    }

    componentDidMount() {
        if (this.state.branch) {
            return;
        }

        vscode.postMessage({
            action: 'get-data'
        });
    }

    t = text_id => {
        if (this.texts[text_id]) {
            return this.texts[text_id];
        }
        vscode.postMessage({
            action: 'get-text',
            text_id: text_id
        });
        this.num_text_requests++;
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

    saveReleaseFile = () => {
        vscode.postMessage({
            action: 'save-release-file'
        });
    }

    backToStep = step => {
        switch (step) {
            case Step.Type:
                this.setStates({
                    step: step,
                    files: [],
                    package_path: null,
                    saved_path: null
                });
                break;
            case Step.Diff:
                this.setStates({
                    step: step,
                    package_path: null,
                    saved_path: null
                });
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

    render() {
        if (!this.state.branch) {
            return null;
        }

        const t = this.t;

        const BranchInfo =
            <div style={{ marginBottom: 24 }}>
                <H5>{t('CurrentBranchInfo')}:</H5>
                {t('branch')}: <strong>{this.state.branch.name}</strong>
                <br />
                {t('commit')}: <strong>{this.state.branch.commit}</strong>
            </div>;

        const ReleaseType =
            <>
                <div className='flex-start'>
                    <H4 style={{ marginRight: 48 }}>{t('ReleaseType')}:</H4>
                    <RadioGroup onChange={this.onReleaseTypeChange} selectedValue={this.state.release_type}>
                        <Radio label={t('CreateFullRelease')} value='full' />
                        <Radio label={t('CreateIncrementalRelease')} value='incremental' />
                        <Radio label={t('UseExistingRelease')} value='existing' />
                    </RadioGroup>
                </div>
                <hr style={{marginBottom: 16}} />
            </>;

        const FullRelease =
            <>
                <H3 style={{ marginBottom: 24 }}>{t('FullRelease')}</H3>
                {BranchInfo}
                <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-end'}} >
                    <Button icon={this.state.pending ? <Spinner size={18} /> : 'arrow-right'}
                        onClick={this.createFullPackage}
                        disabled={!this.state.branch.up_to_date || this.state.pending}
                    >
                    {t('CreatePackage')}
                    </Button>
                </div>
            </>;

        const IncrementalRelease =
            <>
                <H3 style={{ marginBottom: 24 }}>{t('IncrementalRelease')}</H3>
                {BranchInfo}
                <hr />
                <SelectCommit
                    selectCommit={this.selectCommit}
                    disabled={!this.state.branch.up_to_date || this.state.pending}
                    pending={this.state.pending}
                />
            </>;

        const ExistingRelease =
            <Button icon='folder-open' onClick={this.getReleaseFile}>
            {t('PickReleaseFile')}
            </Button>;

        const StepDiff =
            <Card className='step-card bp3-elevation-2'>
                <BackForwardButtons
                    onBack={() => this.backToStep(Step.Type)}
                    onForward={this.createPackage}
                    forward_text_id='CreatePackage'
                    disabled={this.state.pending}
                    pending={this.state.pending}
                />
                <H4 style={{marginTop: 12}}>{t('PackageContents')}</H4>
                <H5>{t('SelectedCommit')}: <strong>{this.state.selected_commit}</strong></H5>
                {this.state.files && this.state.files.map(file => <div>{file}</div>)}
            </Card>;

        const StepSend =
            <Card className='step-card bp3-elevation-2'>
                <BackForwardButtons
                    onBack={() => this.backToStep(this.state.release_type == 'incremental' ?
                                                        Step.Diff : Step.Type)}
                    onForward={this.deployPackage}
                    t={t}
                    forward_text_id='DeployPackage'
                    pending={this.state.pending}
                />
                <H5>{this.state.release_type == 'existing'
                        ? t('ExistingReleaseFileWillBeSent')
                        : t('NewReleaseFileWillBeSent')
                    }:
                </H5>
                <div>{this.state.package_path}</div>
                {this.state.release_type == 'existing' ||
                    <>
                        <hr style={{marginTop: 20, marginBottom: 20}} />
                        {this.state.saved_path == null &&
                            <>
                                <H5>{t('ReleaseFileCanBeSaved')}:</H5>
                                <Button icon='floppy-disk' onClick={this.saveReleaseFile}>
                                {t('SaveReleaseFile')}
                                </Button>
                            </>
                        }
                        {this.state.saved_path != null &&
                            <>
                                <H5>{t('ReleaseFileHasBeenSavedAs')}</H5>
                                {this.state.saved_path}
                            </>
                        }
                    </>
                }
            </Card>;

        const StepClose =
            <Card className='step-card bp3-elevation-2'>
                <BackForwardButtons
                    onBack={() => this.backToStep(Step.Send)}
                    onClose={this.close}
                    t={t}
                />
                {this.state.result &&
                    <>
                        <H5>{t('WaitForDeploymentResult1')}</H5>
                        {t('WaitForDeploymentResult2')}
                    </>
                }
                {!this.state.result &&
                    <H5>{t('PackageDeploymentFailed')}</H5>
                }
            </Card>;

        const NotUpToDateMsg =
            <MessageDialog
                isOpen={this.state.not_up_to_date_msg_open}
                onClose={() => this.setState({not_up_to_date_msg_open: false})}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
                text={t('GitBranchNotUpToDate')}
                style={{maxWidth: 400}}
                buttons={[{
                    title: t('ClosePage'),
                    intent: Intent.DANGER,
                    onClick: this.close
                }]}
            />;

        return (
            <div className='flex-start'>
                {NotUpToDateMsg}

                <img style={{ maxWidth: 36, maxHeight: 36, margin: '24px 0 0 12px' }} src={logo} />

                {this.state.step == Step.Type &&
                    <Card className='step-card bp3-elevation-2'>
                        {ReleaseType}

                        <Collapse isOpen={this.state.release_type == 'full'}>
                            {FullRelease}
                        </Collapse>

                        <Collapse isOpen={this.state.release_type == 'incremental'}>
                            {IncrementalRelease}
                        </Collapse>

                        <Collapse isOpen={this.state.release_type == 'existing'} className='flex-center'>
                            {ExistingRelease}
                        </Collapse>
                    </Card>
                }

                {this.state.step == Step.Diff && StepDiff}

                {this.state.step == Step.Send && StepSend}

                {this.state.step == Step.Close && StepClose}
            </div>
        );
    }
}
