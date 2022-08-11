import {
  Button,
  Callout,
  Card,
  Collapse,
  Colors,
  H3,
  H4,
  H5,
  Intent,
  Spinner,
} from '@blueprintjs/core';
import { size } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { MessageDialog } from '../common/MessageDialog';
import { vscode } from '../common/vscode';
import Select from '../components/Field/select';
import Spacer from '../components/Spacer';
import SubField from '../components/SubField';
import withInitialDataConsumer from '../hocomponents/withInitialDataConsumer';
import withTextContext from '../hocomponents/withTextContext';
import { BackForwardButtons } from './BackForwardButtons';
import { CustomRelease } from './CustomRelease';
import { SelectCommitContainer as SelectCommit } from './SelectCommit';

const Step = { Type: 0, Diff: 1, Send: 2, Close: 3 };

class ReleasePackage extends Component<
  any,
  {
    selectedInterfaces: string[];
  }
> {
  state: { selectedInterfaces: string[] } = {
    selectedInterfaces: [],
  };

  constructor() {
    super();

    this.getBranch();

    window.addEventListener('message', (event) => {
      switch (event.data.action) {
        case 'release-return-branch':
          this.props.setBranch(event.data.branch);
          break;
        case 'release-return-diff':
          this.props.setStep(Step.Diff);
          this.props.setSelectedCommit(event.data.commit);
          this.props.setFiles(event.data.files);
          this.props.setPending(false);
          break;
        case 'release-package-created':
        case 'release-return-package':
          this.props.setStep(Step.Send);
          this.props.setPackagePath(event.data.package_path);
          this.props.setPending(false);
          break;
        case 'release-deployment-result':
          this.props.setStep(Step.Close);
          this.props.setResult(event.data.result);
          this.props.setPending(false);
          break;
        case 'release-branch-not-up-to-date':
          this.props.setNotUpToDateMsgOpen(true);
          this.props.setBranch(event.data.branch);
          this.props.setPending(false);
          break;
        case 'release-package-saved':
          this.props.setSavedPath(event.data.saved_path);
          break;
      }
    });
  }

  getBranch() {
    vscode.postMessage({
      action: 'release-get-branch',
    });
  }

  onReleaseTypeChange = (_name, value) => {
    this.props.setReleaseType(value);

    if (value === 'custom') {
      vscode.postMessage({
        action: 'get-all-interfaces',
      });
    }
  };

  selectCommit = (commit) => {
    vscode.postMessage({
      action: 'release-get-diff',
      commit: commit,
    });
    this.props.setPending(true);
  };

  createPackage = () => {
    vscode.postMessage({
      action: 'release-create-package',
      full: false,
    });
    this.props.setPending(true);
  };

  createFullPackage = () => {
    vscode.postMessage({
      action: 'release-create-package',
      full: true,
    });
    this.props.setPending(true);
  };

  createCustomPackage = () => {
    vscode.postMessage({
      action: 'release-create-package',
      custom: true,
      files: this.state.selectedInterfaces,
    });
    this.props.setPending(true);
  };

  deployPackage = () => {
    vscode.postMessage({
      action: 'release-deploy-package',
    });
    this.props.setPending(true);
  };

  getReleaseFile = () => {
    vscode.postMessage({
      action: 'release-get-package',
    });
    this.props.setPending(true);
  };

  saveReleaseFile = () => {
    vscode.postMessage({
      action: 'release-save-package',
    });
  };

  backToStep = (step) => {
    switch (step) {
      case Step.Type:
        this.props.setStep(step);
        this.props.setFiles([]);
        this.props.setPackagePath(null);
        this.props.setSavedPath(null);
        break;
      case Step.Diff:
        this.props.setStep(step);
        this.props.setPackagePath(null);
        this.props.setSavedPath(null);
        break;
      case Step.Send:
        this.props.setStep(step);
        break;
    }
  };

  render() {
    if (!this.props.branch) {
      return null;
    }

    const t = this.props.t;
    const { selectedInterfaces } = this.state;

    const BranchInfo = (
      <div style={{ marginBottom: 24 }}>
        <H5>{t('CurrentBranchInfo')}:</H5>
        {t('branch')}: <strong>{this.props.branch.name}</strong>
        <br />
        {t('commit')}: <strong>{this.props.branch.commit}</strong>
      </div>
    );

    const NotUpToDate = (
      <>
        <div className="flex-start">
          <div style={{ maxWidth: 400, color: Colors.RED3, marginRight: 24 }}>
            {t('GitBranchNotUpToDate')}
          </div>
          <Button
            icon="refresh"
            title={t('Refresh')}
            style={{ margin: '-8px 0 8px 12px' }}
            onClick={this.getBranch}
          />
        </div>
        <hr style={{ marginTop: 16, marginBottom: 16 }} />
      </>
    );

    const ReleaseType = (
      <>
        {this.props.branch.up_to_date || NotUpToDate}
        <div>
          <h2>{t('CreateRelease')}</h2>
          <SubField subtle desc="Select the type of release you would like to create">
            <Select
              fill
              defaultItems={[
                { name: 'custom' },
                { name: 'full' },
                { name: 'incremental' },
                { name: 'existing' },
              ]}
              onChange={this.onReleaseTypeChange}
              value={`Selected release type - ${this.props.release_type}`}
            />
          </SubField>
        </div>
        <Spacer size={20} />
      </>
    );

    const FullRelease = (
      <>
        <H3 style={{ marginBottom: 24 }}>{t('FullRelease')}</H3>
        {BranchInfo}
        <div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-end' }}>
          <Button
            icon={this.props.pending ? <Spinner size={18} /> : 'arrow-right'}
            onClick={this.createFullPackage}
            disabled={!this.props.branch.up_to_date || this.props.pending}
          >
            {t('CreatePackage')}
          </Button>
        </div>
      </>
    );

    const IncrementalRelease = (
      <>
        <H3 style={{ marginBottom: 24 }}>{t('IncrementalRelease')}</H3>
        {BranchInfo}
        <hr />
        <SelectCommit
          selectCommit={this.selectCommit}
          disabled={!this.props.branch.up_to_date || this.props.pending}
          pending={this.props.pending}
        />
      </>
    );

    const ExistingRelease = (
      <Button icon="folder-open" onClick={this.getReleaseFile}>
        {t('PickReleaseFile')}
      </Button>
    );

    const StepDiff = (
      <Card className="step-card bp3-elevation-2">
        <BackForwardButtons
          onBack={() => this.backToStep(Step.Type)}
          onForward={this.createPackage}
          forward_text_id="CreatePackage"
          disabled={this.props.pending}
          pending={this.props.pending}
        />
        <H4 style={{ marginTop: 12 }}>{t('PackageContents')}</H4>
        <H5>
          {t('SelectedBranch')}: <strong>{this.props.selected_commit}</strong>
        </H5>
        {this.props.files && this.props.files.map((file) => <div>{file}</div>)}
      </Card>
    );

    const StepSend = (
      <Card className="step-card bp3-elevation-2">
        <BackForwardButtons
          onBack={() =>
            this.backToStep(this.props.release_type == 'incremental' ? Step.Diff : Step.Type)
          }
          onForward={this.deployPackage}
          forward_text_id="DeployPackage"
          pending={this.props.pending}
          disabled={!this.props.initialData?.qorus_instance}
        />
        <H5>
          {this.props.release_type == 'existing'
            ? t('ExistingReleaseFileWillBeSent')
            : t('NewReleaseFileWillBeSent')}
          :
        </H5>
        <div>{this.props.package_path}</div>
        {this.props.release_type == 'existing' || (
          <>
            <hr style={{ marginTop: 20, marginBottom: 20 }} />
            {this.props.saved_path == null && (
              <>
                <H5>{t('ReleaseFileCanBeSaved')}:</H5>
                <Button icon="floppy-disk" onClick={this.saveReleaseFile}>
                  {t('SaveReleaseFile')}
                </Button>
              </>
            )}
            {this.props.saved_path != null && (
              <>
                <H5>{t('ReleaseFileHasBeenSavedAs')}</H5>
                {this.props.saved_path}
              </>
            )}
          </>
        )}
      </Card>
    );

    const StepClose = (
      <Card className="step-card bp3-elevation-2">
        <BackForwardButtons
          onBack={() => this.backToStep(Step.Send)}
          onClose={() => this.backToStep(Step.Type)}
        />
        {this.props.result && (
          <>
            <H5>{t('WaitForDeploymentResult1')}</H5>
            {t('WaitForDeploymentResult2')}
          </>
        )}
        {!this.props.result && <H5>{t('PackageDeploymentFailed')}</H5>}
      </Card>
    );

    const NotUpToDateMsg = (
      <MessageDialog
        isOpen={this.props.not_up_to_date_msg_open}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        text={t('GitBranchNotUpToDate')}
        style={{ maxWidth: 400 }}
        buttons={[
          {
            title: t('ButtonOk'),
            intent: Intent.DANGER,
            onClick: () => {
              this.backToStep(Step.Type);
              this.props.setNotUpToDateMsgOpen(false);
            },
          },
        ]}
      />
    );

    return (
      <div className="flex-start" style={{ width: '100%' }}>
        {NotUpToDateMsg}

        {this.props.step == Step.Type && (
          <Card
            className="step-card bp3-elevation-2"
            style={{
              width: '100%',
              overflowY: this.props.release_type === 'custom' ? 'hidden' : 'auto',
              display: 'flex',
              flexFlow: 'column nowrap',
            }}
          >
            {ReleaseType}
            <Collapse isOpen={this.props.release_type == 'custom'} className="flex-fix-scroll-y">
              <Callout
                intent="primary"
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <div>{t('SelectCustomReleaseInterfaces')}</div>
                {size(selectedInterfaces) ? (
                  <Button
                    onClick={this.createCustomPackage}
                    intent="primary"
                    icon="arrow-right"
                    disabled={this.props.pending}
                  >
                    {this.props.pending
                      ? t('Working')
                      : `${t('CreateCustomRelease')} (${size(selectedInterfaces)})`}
                  </Button>
                ) : null}
              </Callout>
              <Spacer size={20} />
              <CustomRelease
                selected={selectedInterfaces}
                onItemClick={(selectedItems: string[], isDeselect) => {
                  // Remove or add items from the selected interfaces
                  if (isDeselect) {
                    this.setState({
                      selectedInterfaces: selectedInterfaces.filter(
                        (item) => !selectedItems.includes(item)
                      ),
                    });
                  } else {
                    // Add items to the selected interfaces
                    const newSelectedInterfaces = [
                      ...selectedInterfaces,
                      ...selectedItems.filter((item) => {
                        // Filter out duplicates
                        return !selectedInterfaces.includes(item);
                      }),
                    ];

                    this.setState({
                      selectedInterfaces: newSelectedInterfaces,
                    });
                  }
                }}
              />
            </Collapse>

            <Collapse isOpen={this.props.release_type == 'full'}>{FullRelease}</Collapse>

            <Collapse isOpen={this.props.release_type == 'incremental'}>
              {IncrementalRelease}
            </Collapse>

            <Collapse isOpen={this.props.release_type == 'existing'} className="flex-center">
              {ExistingRelease}
            </Collapse>
          </Card>
        )}

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

const mapDispatchToProps = (dispatch) => ({
  setStep: (step) => dispatch({ type: 'release_step', release_step: step }),
  setBranch: (branch) => dispatch({ type: 'release_branch', release_branch: branch }),
  setReleaseType: (type) => dispatch({ type: 'release_type', release_type: type }),
  setSelectedCommit: (commit) => dispatch({ type: 'release_commit', release_commit: commit }),
  setFiles: (files) => dispatch({ type: 'release_files', release_files: files }),
  setPending: (pending) => dispatch({ type: 'release_pending', release_pending: pending }),
  setPackagePath: (path) => dispatch({ type: 'release_package_path', release_package_path: path }),
  setSavedPath: (path) => dispatch({ type: 'release_saved_path', release_saved_path: path }),
  setResult: (result) => dispatch({ type: 'release_result', release_result: result }),
  setNotUpToDateMsgOpen: (open) => dispatch({ type: 'release_not_up_to_date_msg_open', open }),
});

export const ReleasePackageContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTextContext(),
  withInitialDataConsumer()
)(ReleasePackage);
