import React, { Component } from 'react';
import { Button, ControlGroup, H4, InputGroup, Spinner } from '@blueprintjs/core';
import { vscode } from '../common/vscode';


export class SelectCommit extends Component {
    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-commits':
                    const commits = event.data.commits;
                    this.setStates({
                        commits: commits
                    });
                    if (!this.state.value && commits && commits.length) {
                        this.setState({value: commits[0].hash});
                    }
                    break;
            }
        });
    }

    componentDidMount() {
        const state = vscode.getState();
        if (state) {
            const {commits, hash_filter, branch_filter, tag_filter, value} = state;
            this.setState({commits, hash_filter, branch_filter, tag_filter, value});

            if (state.commits) {
                return;
            }
        }

        vscode.postMessage({
            action: 'get-commits',
            hash_filter: '',
            branch_filter: '',
            tag_filter: ''
        });
    }

    setVscodeState = state => {
        vscode.setState(Object.assign(vscode.getState() || {}, state));
    }

    setStates = state => {
        this.setVscodeState(state);
        this.setState(state);
    }

    onFilterChange = (filter_type, ev = null) => {
        let new_state = Object.assign({}, this.state);
        new_state[filter_type + '_filter'] = ev ? ev.target.value : '',

        vscode.postMessage({
            action: 'get-commits',
            hash_filter: new_state.hash_filter,
            branch_filter: new_state.branch_filter,
            tag_filter: new_state.tag_filter
        });

        this.setStates(new_state);
    }

    onValueChange = ev => {
        this.setStates({value: ev.target.value});
    }

    render() {
        if (!this.state || !this.state.commits) {
            return null;
        }

        const ClearButton = props => <Button icon='cross' minimal={true} {...props} />;

        const options = this.state.commits.map(commit => {
            const hash = commit.hash;
            let text = ''
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
                <H4>{t('SelectCommit')}</H4>
                <ControlGroup className='bp3-monospace-text' vertical={true}>
                    <InputGroup className='filter-input'
                        leftIcon='git-commit'
                        placeholder={t('filterByCommitHash')}
                        value={this.state.hash_filter}
                        onChange={ev => this.onFilterChange('hash', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=<ClearButton disabled={this.props.disabled}
                                                  onClick={() => this.onFilterChange('hash')} />
                    />
                    <InputGroup className='filter-input'
                        leftIcon='git-branch'
                        placeholder={t('filterByBranchName')}
                        value={this.state.branch_filter}
                        onChange={ev => this.onFilterChange('branch', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=<ClearButton disabled={this.props.disabled}
                                                  onClick={() => this.onFilterChange('branch')} />
                    />
                    <InputGroup className='filter-input'
                        leftIcon='tag'
                        placeholder={t('filterByTag')}
                        value={this.state.tag_filter}
                        onChange={ev => this.onFilterChange('tag', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=<ClearButton disabled={this.props.disabled}
                                                  onClick={() => this.onFilterChange('tag')} />
                    />
                    <select size='12'
                        onChange={this.onValueChange}
                        value={this.state.value}
                        disabled={this.props.disabled}
                    >
                        {options}
                    </select>
                </ControlGroup>
                <div className='flex-center'>
                    <Button icon={this.props.pending ? <Spinner size={18} /> : 'tick'}
                        onClick={() => this.props.selectCommit(this.state.value)}
                        style={{ marginTop: 18 }}
                        disabled={this.props.disabled}
                    >
                        {t('ButtonOk')}
                    </Button>
                </div>
            </>
        );
    }
}
