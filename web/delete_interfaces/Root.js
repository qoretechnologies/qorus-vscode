import React, { Component } from 'react';
import { Button, Checkbox, HTMLSelect, HTMLTable, Radio, RadioGroup } from '@blueprintjs/core';
import { vscode } from '../common/vscode';
import { Fg } from '../common/Fg';
import logo from '../../images/qorus_logo_256.png';


const columns = {
    workflows: ['name', 'version', 'workflowid', 'description'],
    services:  ['name', 'version', 'serviceid'],
    jobs:      ['name', 'version', 'jobid', 'description'],
    classes:   ['name', 'version', 'classid', 'description', 'language'],
    constants: ['name', 'version', 'constantid', 'description'],
    mappers:   ['name', 'version', 'mapperid', 'desc', 'type'],
    functions: ['name', 'version', 'function_instanceid', 'description'],
};

export class Root extends Component {
    constructor() {
        super();

        this.texts = {};
        this.num_text_requests = 0;

        const state = vscode.getState();
        if (state) {
            const {iface_kind, interfaces, checked} = state;
            this.state = {iface_kind, interfaces, checked};
        }
        else {
            this.state = {
                iface_kind: 'workflows',
                interfaces: {},
                checked: {}
            };
            this.setVscodeState(this.state);
        }

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-interfaces':
                    const iface_kind = event.data.iface_kind;
                    let interfaces = Object.assign({}, this.state.interfaces);
                    interfaces[iface_kind] = event.data.data;
                    let checked = Object.assign({}, this.state.checked);
                    checked[iface_kind] = {};
                    this.setStates({iface_kind, interfaces, checked});
                    break;
                case 'return-text':
                    this.texts[event.data.text_id] = event.data.text;
                    if (--this.num_text_requests == 0) {
                        this.forceUpdate();
                    }
                    break;
                case 'deletion-finished':
                    this.getInterfaces(event.data.iface_kind);
                    break;
            }
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

    deleteSelected = () => {
        const interfaces = this.state.checked[this.state.iface_kind];
        let ids = [];
        for (let id in interfaces) {
            if(interfaces[id]) {
                ids.push(id)
            }
        }

        vscode.postMessage({
            action: 'delete-interfaces',
            iface_kind: this.state.iface_kind,
            ids: ids
        });
    }

    onInterfaceKindChange = ev => {
        this.setStates({iface_kind: ev.target.value === 'other' ? 'classes' : ev.target.value});
    }

    onCheckChange = (id, ev) => {
        let checked = JSON.parse(JSON.stringify(this.state.checked));
        checked[this.state.iface_kind] || (checked[this.state.iface_kind] = {});
        checked[this.state.iface_kind][id] = ev.target.checked;
        this.setStates({checked});
    }

    currentKindInterfaces = () => this.state.interfaces[this.state.iface_kind];

    getInterfaces = (iface_kind = this.state.iface_kind) => {
        vscode.postMessage({
            action: 'get-interfaces',
            iface_kind: iface_kind,
            columns: columns[iface_kind]
        });
    }

    isOtherKind = () => !['workflows', 'services', 'jobs'].includes(this.state.iface_kind);

    isChecked = id =>
        (this.state.checked[this.state.iface_kind] &&
         this.state.checked[this.state.iface_kind][id]) || false;

    isAnyChecked = () =>
        this.currentKindInterfaces().some(iface => this.isChecked(iface.id));

    areAllChecked = () =>
        this.currentKindInterfaces().every(iface => this.isChecked(iface.id));

    checkAll = () => {
        const value = !this.areAllChecked();
        let checked = JSON.parse(JSON.stringify(this.state.checked));
        checked[this.state.iface_kind] || (checked[this.state.iface_kind] = {});
        this.currentKindInterfaces().map(iface => checked[this.state.iface_kind][iface.id] = value);
        this.setStates({checked});
    }

    render() {
        if (!this.currentKindInterfaces()) {
            this.getInterfaces();
            return null;
        }

        const t = this.t;

        const InterfaceKind =
            <RadioGroup
                onChange={this.onInterfaceKindChange}
                selectedValue={this.isOtherKind() ? 'other' : this.state.iface_kind}
                inline={true}
                className='iface-kind-radio-group'
            >
                <Radio label={t('Workflows')} value='workflows' className='iface-kind-radio-button' />
                <Radio label={t('Services')} value='services' className='iface-kind-radio-button' />
                <Radio label={t('Jobs')} value='jobs' className='iface-kind-radio-button' />
                <Radio label={t('Other')} value='other' className='iface-kind-radio-button' />
            </RadioGroup>;

        const OtherKind = this.isOtherKind() &&
            <HTMLSelect
                className='iface-kind-select'
                onChange={this.onInterfaceKindChange}
                value={this.state.iface_kind}
            >
                {['classes', 'constants', 'mappers', 'functions'].map(iface_kind =>
                    <option value={iface_kind}>{iface_kind}</option>
                )}
            </HTMLSelect>;

        const Interfaces =
            <HTMLTable condensed={true} interactive={true} style={{ marginLeft: 24 }}>
                <thead>
                    <tr>
                        <td>
                            <Checkbox
                                style={{ margin: 0 }}
                                checked={this.areAllChecked()}
                                onChange={this.checkAll}
                            />
                        </td>
                        {columns[this.state.iface_kind].map(column => <td><Fg text={t('ColumnHeader-' + column)} /></td>)}
                        <Button
                            icon='trash'
                            style={{ marginTop: -8, marginBottom: 8 }}
                            onClick={this.deleteSelected}
                            disabled={!this.isAnyChecked()}
                        >
                            {t('DeleteSelected') + ' ' + t(this.state.iface_kind)}
                        </Button>
                        <Button
                            icon='refresh'
                            style={{ margin: '-8px 0 8px 12px' }}
                            onClick={() => this.getInterfaces()}
                        />
                    </tr>
                </thead>
                <tbody>
                    {this.currentKindInterfaces().map(iface =>
                        <tr key={iface.name + iface.id}>
                            <td>
                                <Checkbox
                                    style={{ marginBottom: 0 }}
                                    onChange={this.onCheckChange.bind(null, iface.id)}
                                    checked={this.isChecked(iface.id)}
                                />
                            </td>
                            {columns[this.state.iface_kind].map(column =>
                                <td className='iface-cell'><Fg text={iface[column]} /></td>
                            )}
                        </tr>
                    )}
                </tbody>
            </HTMLTable>;

        return (
            <div className='fg-color'>
                <div className='flex-start'>
                    <img style={{ maxWidth: 36, maxHeight: 36, margin: '24px 0 0 12px' }} src={logo} />
                    {InterfaceKind}
                    {this.isOtherKind() && OtherKind}
                </div>
                <hr style={{ marginBottom: 16 }} />

                {Interfaces}
            </div>
        );
    }
}
