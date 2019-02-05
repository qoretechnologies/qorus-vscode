import React, { Component } from 'react';
import { Button, ControlGroup, H4, InputGroup, Spinner } from '@blueprintjs/core';


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

    componentWillMount() {
        const state = this.props.vscode.getState();
        if (state) {
            const {commits, hash_filter, branch_filter, tag_filter, value} = state;
            this.setState({commits, hash_filter, branch_filter, tag_filter, value});

            if (state.commits) {
                return;
            }
        }

        this.props.vscode.postMessage({
            action: 'get-commits',
            hash_filter: '',
            branch_filter: '',
            tag_filter: ''
        });
    }

    setVscodeState = state => {
        this.props.vscode.setState(Object.assign(this.props.vscode.getState() || {}, state));
    }

    setStates = state => {
        this.setVscodeState(state);
        this.setState(state);
    }

    onFilterChange = (filter_type, ev = null) => {
        let new_state = Object.assign({}, this.state);
        new_state[filter_type + '_filter'] = ev ? ev.target.value : '',

        this.props.vscode.postMessage({
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
        if (!this.state.commits) {
            return null;
        }

        let options = [];
        for (let commit of this.state.commits) {
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

            options.push(
                <option key={hash} value={hash}>
                    {hash.substr(0, 12)}&nbsp;&nbsp;{text}
                </option>
            );
        }

        return (
            <>
                <H4>{this.props.t('SelectCommit')}</H4>
                <ControlGroup className='bp3-monospace-text' vertical={true}>
                    <InputGroup className='filter-input'
                        leftIcon='git-commit'
                        placeholder={this.props.t('filterByCommitHash')}
                        value={this.state.hash_filter}
                        onChange={ev => this.onFilterChange('hash', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=
                            <ClearButton disabled={this.props.disabled} onClick={() => this.onFilterChange('hash')} />
                    />
                    <InputGroup className='filter-input'
                        leftIcon='git-branch'
                        placeholder={this.props.t('filterByBranchName')}
                        value={this.state.branch_filter}
                        onChange={ev => this.onFilterChange('branch', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=
                            <ClearButton disabled={this.props.disabled} onClick={() => this.onFilterChange('branch')} />
                    />
                    <InputGroup className='filter-input'
                        leftIcon='tag'
                        placeholder={this.props.t('filterByTag')}
                        value={this.state.tag_filter}
                        onChange={ev => this.onFilterChange('tag', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=
                            <ClearButton disabled={this.props.disabled} onClick={() => this.onFilterChange('tag')} />
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
                        {this.props.t('ButtonOk')}
                    </Button>
                </div>
            </>
        );
    }
}

const ClearButton = props => (
    <Button icon='cross' minimal={true} {...props} />
);
