import { Button } from '@blueprintjs/core';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreH3,
  ReqoreInput,
  ReqoreSpacer,
} from '@qoretechnologies/reqore';
import { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { vscode } from '../common/vscode';
import withTextContext from '../hocomponents/withTextContext';

class SelectCommit extends Component {
  constructor() {
    super();

    window.addEventListener('message', (event) => {
      switch (event.data.action) {
        case 'release-return-commits':
          const commits = event.data.commits;
          this.props.setCommits(commits);
          if (!this.props.value && commits && commits.length) {
            this.props.setValue(commits[0].hash);
          }
          break;
      }
    });
  }

  componentDidMount() {
    if (!this.props.commits) {
      vscode.postMessage({
        action: 'release-get-commits',
        filters: { hash: '', branch: '', tag: '' },
      });
    }
  }

  onFilterChange = (filter_type, ev = null) => {
    const filters = {
      hash: this.props.hash_filter,
      branch: this.props.branch_filter,
      tag: this.props.tag_filter,
    };
    (filters[filter_type] = ev ? ev.target.value : ''),
      vscode.postMessage({
        action: 'release-get-commits',
        filters,
      });

    this.props.setFilter(filter_type, filters[filter_type]);
  };

  onValueChange = (ev) => {
    this.props.setValue(ev.target.value);
  };

  render() {
    if (!this.props || !this.props.commits) {
      return null;
    }

    const ClearButton = (props) => <Button icon="cross" minimal={true} {...props} />;

    const options = this.props.commits.map((commit) => {
      const hash = commit.hash;
      let text = '';
      if (commit.local) {
        text += commit.local;
      }
      if (commit.remote) {
        if (commit.local) {
          text += ' | ';
        }
        text += commit.remote;
      }
      if (commit.tag) {
        text += ' [tag "' + commit.tag + '"]';
      }

      return (
        <option key={hash} value={hash}>
          {hash.substr(0, 12)}&nbsp;&nbsp;{text}
        </option>
      );
    });

    const t = this.props.t;

    return (
      <>
        <ReqoreH3>{t('SelectBranch')}</ReqoreH3>
        <ReqoreSpacer height={15} />
        <ReqoreControlGroup vertical stack fluid>
          <ReqoreInput
            placeholder={t('filterByCommitHash')}
            value={this.props.hash_filter}
            onChange={(ev) => this.onFilterChange('hash', ev)}
            onFocus={this.props.onFilterFocus}
            onClearClick={() => this.onFilterChange('hash')}
          />
          <ReqoreInput
            placeholder={t('filterByBranchName')}
            value={this.props.branch_filter}
            onChange={(ev) => this.onFilterChange('branch', ev)}
            onFocus={this.props.onFilterFocus}
            onClearClick={() => this.onFilterChange('branch')}
          />
          <ReqoreInput
            placeholder={t('filterByTag')}
            value={this.props.tag_filter}
            onChange={(ev) => this.onFilterChange('tag', ev)}
            onFocus={this.props.onFilterFocus}
            onClearClick={() => this.onFilterChange('tag')}
          />
        </ReqoreControlGroup>
        <ReqoreSpacer height={15} />
        <select
          size={12}
          onChange={this.onValueChange}
          value={this.props.value}
          disabled={this.props.disabled}
          style={{ width: '100%' }}
        >
          {options}
        </select>
        <ReqoreSpacer height={15} />
        <ReqoreButton
          icon={'CheckLine'}
          intent="info"
          onClick={() => this.props.selectCommit(this.props.value)}
          disabled={this.props.disabled || this.props.pending}
        >
          {t('ButtonOk')}
        </ReqoreButton>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  commits: state.release_commits,
  hash_filter: state.release_filter.hash,
  branch_filter: state.release_filter.branch,
  tag_filter: state.release_filter.tag,
  value: state.release_commit_hash,
});

const mapDispatchToProps = (dispatch) => ({
  setCommits: (commits) => dispatch({ type: 'release_commits', release_commits: commits }),
  setFilter: (filter, value) => dispatch({ type: 'release_filter', filter, value }),
  setValue: (value) => dispatch({ type: 'release_commit_hash', release_commit_hash: value }),
});

export const SelectCommitContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTextContext()
)(SelectCommit);
