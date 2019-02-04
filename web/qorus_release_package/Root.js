import React, { Component } from 'react';
import { Button, Card, Collapse, Colors, Elevation, H3, H4, H5, Radio, RadioGroup } from '@blueprintjs/core';
import {BackForwardButtons } from './BackForwardButtons';
import {SelectCommit } from './SelectCommit';
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
                        files: event.data.files
                    });
                    break;
                case 'return-text':
                    this.setStates({texts: Object.assign(this.state.texts || {},
                                                         {[event.data.text_id]: event.data.text})});
                    break;
                case 'package-created':
                    this.setStates({step: 2, tmp_files: event.data.tmp_files});
                    break;
                case 'deployment-result':
                    this.setStates({step: 3, result: event.data.result});
                    break;
            }
        });
    }

    componentWillMount() {
        const state = vscode.getState();
        if (state) {
            const {step, branch, release_type, selected_commit, files, tmp_files, result, texts} = state;
            this.setState({step, branch, release_type, selected_commit, files, tmp_files, result, texts});

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
                texts: {}
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
    }

    createPackage = () => {
        vscode.postMessage({
            action: 'create-package'
        });
    }

    createFullPackage = () => {
        vscode.postMessage({
            action: 'create-full-package'
        });
    }

    deployPackage = () => {
        vscode.postMessage({
            action: 'deploy-package'
        });
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
                {this.state.branch.up_to_date ||
                    <>
                        <hr />
                        <H5 style={{ color: Colors.RED5 }}>{this.t('GitBranchNotUpToDate1')}</H5>
                        <strong style={{ color: Colors.RED5 }}>{this.t('GitBranchNotUpToDate2')}</strong>
                    </>
                }
            </div>
        );
    }

    render() {
        if (!this.state.branch) {
            return null;
        }

        const header_style = {marginBottom: 24};

        return (
            <div className='flex-start'>
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
                                <Button icon='arrow-right'
                                    onClick={this.createFullPackage}
                                    disabled={!this.state.branch.up_to_date}
                                >
                                    {this.t('CreatePackage')}
                                </Button>
                            </div>
                        </Collapse>
                        <Collapse isOpen={this.state.release_type == 'incremental'}>
                            <H3 style={header_style}>{this.t('IncrementalRelease')}</H3>
                            {this.renderBranchInfo()}
                            <SelectCommit
                                selectCommit={this.selectCommit}
                                vscode={vscode}
                                disabled={!this.state.branch.up_to_date}
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
