import React, { Component } from 'react';
import { Button, Card, Collapse, H3, H4, H5, Intent, Radio, RadioGroup, Spinner } from '@blueprintjs/core';
import { BackForwardButtons } from './BackForwardButtons';
import { SelectCommit } from './SelectCommit';
import { MessageDialog } from '../common/MessageDialog';
import { vscode } from '../common/vscode';
import logo from '../../images/qorus_logo_256.png';


const Step = {Type: 0, Diff: 1, Send: 2, Close: 3}

class ReleasePackage extends Component {
    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-data':
                    this.setBranch(event.data.branch);
                    break;
                case 'return-diff':
                    this.setStep(Step.Diff);
                    this.setSelectedCommit(event.data.commit);
                    this.setFiles(event.data.files);
                    this.setPending(false);
                    break;
                case 'package-created':
                case 'return-release-file':
                    this.setStep(Step.Send);
                    this.setPackagePath(event.data.package_path);
                    this.setPending(false);
                    break;
                case 'deployment-result':
                    this.setStep(Step.Close);
                    this.setResult(event.data.result);
                    this.setPending(false);
                    break;
                case 'not-up-to-date':
                    this.setNotUpToDateMsgOpen(true);
                    this.setBranch(event.data.branch);
                    this.setPending(false);
                    break;
                case 'release-file-saved':
                    this.setSavedPath(event.data.saved_path);
                    break;
            }
        });
    }

    componentDidMount() {
        if (!this.props.branch) {
            vscode.postMessage({
                action: 'get-data'
            });
        }
    }

    onReleaseTypeChange = ev => {
        this.setReleaseType(ev.target.value);
    }

    selectCommit = commit => {
        vscode.postMessage({
            action: 'get-diff',
            commit: commit
        });
        this.setPending(true);
    }

    createPackage = () => {
        vscode.postMessage({
            action: 'create-package'
        });
        this.setPending(true);
    }

    createFullPackage = () => {
        vscode.postMessage({
            action: 'create-full-package'
        });
        this.setPending(true);
    }

    deployPackage = () => {
        vscode.postMessage({
            action: 'deploy-package'
        });
        this.setPending(true);
    }

    getReleaseFile = () => {
        vscode.postMessage({
            action: 'get-release-file'
        });
        this.setPending(true);
    }

    saveReleaseFile = () => {
        vscode.postMessage({
            action: 'save-release-file'
        });
    }

    backToStep = step => {
        switch (step) {
            case Step.Type:
                this.setStep(step);
                this.setFiles([]);
                this.setPackagePath(null);
                this.setSavedPath(null);
                break;
            case Step.Diff:
                this.setStep(step);
                this.setPackagePath(null);
                this.setSavedPath(null);
                break;
            case Step.Send:
                this.setStep(step);
                break;
        }
    }

    close = () => {
        vscode.postMessage({
            action: 'close'
        });
    }

    render() {
        if (!this.props.branch) {
            return null;
        }

        const t = this.t;

        const BranchInfo =
            <div style={{ marginBottom: 24 }}>
                <H5>{t('CurrentBranchInfo')}:</H5>
                {t('branch')}: <strong>{this.props.branch.name}</strong>
                <br />
                {t('commit')}: <strong>{this.props.branch.commit}</strong>
            </div>;

        const ReleaseType =
            <>
                <div className='flex-start'>
                    <H4 style={{ marginRight: 48 }}>{t('ReleaseType')}:</H4>
                    <RadioGroup onChange={this.onReleaseTypeChange} selectedValue={this.props.release_type}>
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
                    <Button icon={this.props.pending ? <Spinner size={18} /> : 'arrow-right'}
                        onClick={this.createFullPackage}
                        disabled={!this.props.branch.up_to_date || this.props.pending}
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
                    disabled={!this.props.branch.up_to_date || this.props.pending}
                    pending={this.props.pending}
                    t={t}
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
                    disabled={this.props.pending}
                    pending={this.props.pending}
                    t={t}
                />
                <H4 style={{marginTop: 12}}>{t('PackageContents')}</H4>
                <H5>{t('SelectedCommit')}: <strong>{this.props.selected_commit}</strong></H5>
                {this.props.files && this.props.files.map(file => <div>{file}</div>)}
            </Card>;

        const StepSend =
            <Card className='step-card bp3-elevation-2'>
                <BackForwardButtons
                    onBack={() => this.backToStep(this.props.release_type == 'incremental' ?
                                                        Step.Diff : Step.Type)}
                    onForward={this.deployPackage}
                    forward_text_id='DeployPackage'
                    pending={this.props.pending}
                    t={t}
                />
                <H5>{this.props.release_type == 'existing'
                        ? t('ExistingReleaseFileWillBeSent')
                        : t('NewReleaseFileWillBeSent')
                    }:
                </H5>
                <div>{this.props.package_path}</div>
                {this.props.release_type == 'existing' ||
                    <>
                        <hr style={{marginTop: 20, marginBottom: 20}} />
                        {this.props.saved_path == null &&
                            <>
                                <H5>{t('ReleaseFileCanBeSaved')}:</H5>
                                <Button icon='floppy-disk' onClick={this.saveReleaseFile}>
                                {t('SaveReleaseFile')}
                                </Button>
                            </>
                        }
                        {this.props.saved_path != null &&
                            <>
                                <H5>{t('ReleaseFileHasBeenSavedAs')}</H5>
                                {this.props.saved_path}
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
                {this.props.result &&
                    <>
                        <H5>{t('WaitForDeploymentResult1')}</H5>
                        {t('WaitForDeploymentResult2')}
                    </>
                }
                {!this.props.result &&
                    <H5>{t('PackageDeploymentFailed')}</H5>
                }
            </Card>;

        const NotUpToDateMsg =
            <MessageDialog
                isOpen={this.props.not_up_to_date_msg_open}
                onClose={() => this.setNotUpToDateMsgOpen(false)}
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

                {this.props.step == Step.Type &&
                    <Card className='step-card bp3-elevation-2'>
                        {ReleaseType}

                        <Collapse isOpen={this.props.release_type == 'full'}>
                            {FullRelease}
                        </Collapse>

                        <Collapse isOpen={this.props.release_type == 'incremental'}>
                            {IncrementalRelease}
                        </Collapse>

                        <Collapse isOpen={this.props.release_type == 'existing'} className='flex-center'>
                            {ExistingRelease}
                        </Collapse>
                    </Card>
                }

                {this.props.step == Step.Diff && StepDiff}

                {this.props.step == Step.Send && StepSend}

                {this.props.step == Step.Close && StepClose}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    step: state.release_step,
    branch: state.release_branch,
    release_type: state.release_type,
    selected_commit: state.release_commit,
    files: state.release_files,
    package_path: state.release_package_path,
    saved_path: state.release_saved_path,
    result: state.release_result,
    not_up_to_date_msg_open: state.msg_open.release_not_up_to_date,
    pending: state.release_pending,
});

const mapDispatchToProps = dispatch => ({
    setStep: step => dispatch({type: 'release_step', release_step: step}),
    setBranch: branch => dispatch({type: 'release_branch', release_branch: branch}),
    setReleaseType: type => dispatch({type: 'release_type', release_type: type}),
    setSelectedCommit: commit => dispatch({type: 'release_commit', release_commit: commit}),
    setFiles: files => dispatch({type: 'release_files', release_files: files}),
    setPending: pending => dispatch({type: 'release_pending', release_pending: pending}),
    setPackagePath: path => dispatch({type: 'release_package_path', release_package_path: path}),
    setSavedPath: path => dispatch({type: 'release_saved_path', release_saved_path: path}),
    setResult: result => dispatch({type: 'release_result', release_result: result}),
    setNotUpToDateMsgOpen: open => dispatch({type: 'release_not_up_to_date_msg_open', open})
});

export const ReleasePackageContainer = connect(mapStateToProps, mapDispatchToProps)(ReleasePackage);
