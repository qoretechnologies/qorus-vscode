import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreH3,
  ReqoreMessage,
  ReqorePanel,
  ReqoreSpacer,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTag,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { vscode } from '../common/vscode';
import Spacer from '../components/Spacer';
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
    hasRepository?: boolean;
  }
> {
  state: { selectedInterfaces: string[]; hasRepository?: boolean } = {
    selectedInterfaces: [],
    hasRepository: true,
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
        case 'release-no-repository':
          this.setState({ hasRepository: false });
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
      <>
        <ReqoreH3>{t('CurrentBranchInfo')}</ReqoreH3>
        <ReqoreSpacer height={15} />
        <ReqoreTag icon="GitRepositoryLine" labelKey={t('branch')} label={this.props.branch.name} />
        <ReqoreSpacer height={5} />
        <ReqoreTag
          icon="GitRepositoryLine"
          labelKey={t('commit')}
          label={this.props.branch.commit}
        />
        <ReqoreSpacer height={15} />
      </>
    );

    const notUpToDateMsg = () => {
      if (!this.props.branch.up_to_date) {
        return (
          <ReqoreMessage margin="bottom" intent="danger" opaque={false}>
            {t('GitBranchNotUpToDate')} <ReqoreSpacer width={10} />
            <ReqoreTag
              label="Refresh"
              icon="RefreshLine"
              size="small"
              onClick={() => {
                this.backToStep(Step.Type);
                this.props.setNotUpToDateMsgOpen(false);
              }}
            />
          </ReqoreMessage>
        );
      }

      return null;
    };

    const FullRelease = (
      <div>
        {BranchInfo}
        <ReqoreSpacer height={15} />
        <ReqoreButton
          icon="CheckLine"
          onClick={this.createFullPackage}
          disabled={!this.props.branch.up_to_date || this.props.pending}
          intent="info"
        >
          {t('CreatePackage')}
        </ReqoreButton>
      </div>
    );

    const IncrementalRelease = (
      <div>
        {BranchInfo}
        <ReqoreSpacer height={15} />
        <SelectCommit
          selectCommit={this.selectCommit}
          disabled={!this.props.branch.up_to_date || this.props.pending}
          pending={this.props.pending}
        />
      </div>
    );

    const ExistingRelease = (
      <ReqoreControlGroup>
        <ReqoreButton
          icon="FolderAddLine"
          intent="info"
          flat={false}
          minimal
          onClick={this.getReleaseFile}
        >
          {t('PickReleaseFile')}
        </ReqoreButton>
      </ReqoreControlGroup>
    );

    const StepDiff = (
      <div>
        <BackForwardButtons
          onBack={() => this.backToStep(Step.Type)}
          onForward={this.createPackage}
          forward_text_id="CreatePackage"
          disabled={this.props.pending}
          pending={this.props.pending}
        />

        <ReqoreH3>{t('PackageContents')}</ReqoreH3>
        <ReqoreSpacer height={15} />
        <ReqoreTag
          icon="GitRepositoryLine"
          labelKey={t('SelectedBranch')}
          label={this.props.selected_commit}
        />
        {this.props.files && this.props.files.map((file) => <div>{file}</div>)}
      </div>
    );

    const StepSend = (
      <div>
        <BackForwardButtons
          onBack={() =>
            this.backToStep(this.props.release_type == 'incremental' ? Step.Diff : Step.Type)
          }
          onForward={this.deployPackage}
          forward_text_id="DeployPackage"
          pending={this.props.pending}
          disabled={!this.props.initialData?.qorus_instance}
        />
        <ReqoreMessage
          intent="info"
          title={
            this.props.release_type == 'existing'
              ? t('ExistingReleaseFileWillBeSent')
              : t('NewReleaseFileWillBeSent')
          }
          inverted
        >
          {this.props.package_path}
        </ReqoreMessage>
        {this.props.release_type == 'existing' || (
          <>
            <ReqoreSpacer height={15} />
            {this.props.saved_path == null && (
              <>
                <ReqoreButton icon="Save3Fill" onClick={this.saveReleaseFile} intent="info">
                  {t('SaveReleaseFile')}
                </ReqoreButton>
              </>
            )}
            {this.props.saved_path != null && (
              <>
                <ReqoreSpacer height={15} />
                <ReqoreMessage title={t('ReleaseFileHasBeenSavedAs')} intent="info" inverted>
                  {this.props.saved_path}
                </ReqoreMessage>
              </>
            )}
          </>
        )}
      </div>
    );

    const StepClose = (
      <div>
        <BackForwardButtons
          onBack={() => this.backToStep(Step.Send)}
          onClose={() => this.backToStep(Step.Type)}
        />
        {this.props.result && (
          <>
            <ReqoreMessage intent="pending" title={t('WaitForDeploymentResult1')}>
              {t('WaitForDeploymentResult2')}
            </ReqoreMessage>
          </>
        )}
        {!this.props.result && (
          <ReqoreMessage intent="danger">{t('PackageDeploymentFailed')}</ReqoreMessage>
        )}
      </div>
    );

    return (
      <ReqorePanel flat fill>
        <ReqorePanel
          size="big"
          transparent
          minimal
          flat
          fluid
          contentStyle={{
            display: 'flex',
            overflow: 'hidden',
            flexFlow: 'column',
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          {notUpToDateMsg()}
          {!this.state.hasRepository && (
            <ReqoreMessage intent="danger" minimal opaque={false} margin="bottom">
              {t('ReleaseNoRepository')}
            </ReqoreMessage>
          )}
          {this.props.step == Step.Type && (
            <ReqoreTabs
              fillParent
              padded={false}
              activeTabIntent="info"
              activeTab={
                this.props.branch.up_to_date && this.state.hasRepository ? 'full' : 'custom'
              }
              tabs={[
                {
                  label: 'Full Release',
                  id: 'full',
                  disabled: !this.props.branch.up_to_date || !this.state.hasRepository,
                },
                {
                  label: 'Incremental Release',
                  id: 'incremental',
                  disabled: !this.props.branch.up_to_date || !this.state.hasRepository,
                },
                { label: 'Custom Release', id: 'custom' },
                { label: 'Existing Release', id: 'existing' },
              ]}
            >
              <ReqoreTabsContent tabId="full">{FullRelease}</ReqoreTabsContent>
              <ReqoreTabsContent tabId="incremental">{IncrementalRelease}</ReqoreTabsContent>
              <ReqoreTabsContent tabId="custom">
                <ReqoreMessage intent="info" inverted flat>
                  {t('SelectCustomReleaseInterfaces')}
                  <ReqoreSpacer width={10} />
                  {size(selectedInterfaces) ? (
                    <ReqoreButton
                      onClick={this.createCustomPackage}
                      intent="info"
                      icon="GitCommitLine"
                      disabled={this.props.pending}
                    >
                      {this.props.pending
                        ? t('Working')
                        : `${t('CreateCustomRelease')} (${size(selectedInterfaces)})`}
                    </ReqoreButton>
                  ) : null}
                </ReqoreMessage>
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
              </ReqoreTabsContent>
              <ReqoreTabsContent tabId="existing">{ExistingRelease}</ReqoreTabsContent>
            </ReqoreTabs>
          )}
          {this.props.step == Step.Diff && StepDiff}

          {this.props.step == Step.Send && StepSend}

          {this.props.step == Step.Close && StepClose}
        </ReqorePanel>
      </ReqorePanel>
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
