import React, { Component } from 'react';
import { Button, ControlGroup, InputGroup } from '@blueprintjs/core';


export class SelectCommit extends Component {
    constructor() {
        super();

        this.state = {
            data: null,
            filter_pending: false
        };

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-commits':
                    this.setState({
                        data: event.data.commits,
                        filter_pending: false
                    });
                    break;
            }
        });
    }

    componentWillMount() {
        if (this.state.data) {
            return;
        }
        this.props.vscode.postMessage({
            action: 'get-commits',
            hash_filter: '',
            branch_filter: '',
            tag_filter: ''
        });
    }

    onFilterChange = (filter_type, ev = null) => {
        let new_state = Object.assign({}, this.state, {filter_pending: true});
        new_state[filter_type + '_filter'] = ev ? ev.target.value : '',

        this.props.vscode.postMessage({
            action: 'get-commits',
            hash_filter: new_state.hash_filter,
            branch_filter: new_state.branch_filter,
            tag_filter: new_state.tag_filter
        });

        this.setState(new_state);
    }

    render() {
        if (!this.state.data) {
            return null;
        }

        let options = [];
        for (let commit of this.state.data) {
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

            const commit_data = this.state.data[commit];
            options.push(
                <option key={hash} value={hash}>
                    {hash.substr(0, 12)}&nbsp;&nbsp;{text}
                </option>
            );
        }

        return (
            <div>
                <ControlGroup className='bp3-monospace-text' vertical={true}>
                    <InputGroup className='filter-input'
                        leftIcon='git-commit'
                        placeholder={this.props.t('filterByBranchCommitHash')}
                        value={this.state.hash_filter}
                        onChange={ev => this.onFilterChange('hash', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=<Button icon='cross' minimal={true} onClick={() => this.onFilterChange('hash')} />
                    />
                    <InputGroup className='filter-input'
                        leftIcon='git-branch'
                        placeholder={this.props.t('filterByBranchName')}
                        value={this.state.branch_filter}
                        onChange={ev => this.onFilterChange('branch', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=<Button icon='cross' minimal={true} onClick={() => this.onFilterChange('branch')} />
                    />
                    <InputGroup className='filter-input'
                        leftIcon='tag'
                        placeholder={this.props.t('filterByTag')}
                        value={this.state.tag_filter}
                        onChange={ev => this.onFilterChange('tag', ev)}
                        onFocus={this.props.onFilterFocus}
                        rightElement=<Button icon='cross' minimal={true} onClick={() => this.onFilterChange('tag')} />
                    />
                    <select size='12' onChange={this.props.onSelectCommit} value={this.props.selected_commit}>
                        {options}
                    </select>
                </ControlGroup>
                <div className='flex-center'>
                    <Button icon='tick'
                        onClick={this.props.onOk}
                        style={{ marginTop: 18 }}
                        disabled={!this.props.selected_commit}
                    >
                        {this.props.t('buttonOk')}
                    </Button>
                </div>
            </div>
        );
    }
}
