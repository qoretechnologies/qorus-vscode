import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Checkbox,
    Classes,
    HTMLSelect,
    HTMLTable,
    Intent,
    Popover,
    Radio,
    RadioGroup,
    Tabs,
    Tab,
    ButtonGroup,
} from '@blueprintjs/core';
import { vscode } from '../common/vscode';
import { Fg } from '../common/Fg';
import Box, { BoxContent } from '../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../hocomponents/withTextContext';

const columns = {
    workflows: ['name', 'version', 'workflowid', 'description'],
    services: ['name', 'version', 'serviceid', 'description'],
    jobs: ['name', 'version', 'jobid', 'description'],
    steps: ['name', 'version', 'stepid', 'description'],
    classes: ['name', 'version', 'classid', 'description', 'language'],
    mappers: ['name', 'version', 'mapperid', 'desc', 'type'],
};

class DeleteInterfaces extends Component {
    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-interfaces':
                    const iface_kind = event.data.iface_kind;
                    this.props.setIfaceKind(iface_kind);
                    let interfaces = Object.assign({}, this.props.interfaces);
                    interfaces[iface_kind] = event.data.data;
                    this.props.setInterfaces(interfaces);
                    let checked = Object.assign({}, this.props.checked);
                    checked[iface_kind] = {};
                    this.props.setChecked(checked);
                    break;
                case 'deletion-finished':
                    this.getInterfaces(event.data.iface_kind);
                    break;
            }
        });
    }

    deleteSelected = () => {
        const interfaces = this.props.checked[this.props.iface_kind];
        let ids = [];
        for (let id in interfaces) {
            if (interfaces[id]) {
                ids.push(id);
            }
        }

        vscode.postMessage({
            action: 'delete-interfaces',
            iface_kind: this.props.iface_kind,
            ids: ids,
        });
    };

    onInterfaceKindChange = iface_kind => {
        this.props.setIfaceKind(iface_kind);
        if (!this.props.interfaces[iface_kind]) {
            this.getInterfaces(iface_kind);
        }
    };

    componentDidMount() {
        if (!this.currentKindInterfaces()) {
            this.getInterfaces();
        }
    }

    onCheckChange = (id, ev) => {
        let checked = JSON.parse(JSON.stringify(this.props.checked));
        checked[this.props.iface_kind] || (checked[this.props.iface_kind] = {});
        checked[this.props.iface_kind][id] = ev.target.checked;
        this.props.setChecked(checked);
    };

    currentKindInterfaces = () => this.props.interfaces[this.props.iface_kind];

    getInterfaces = (iface_kind = this.props.iface_kind) => {
        vscode.postMessage({
            action: 'get-interfaces',
            iface_kind: iface_kind,
            columns: columns[iface_kind],
        });
    };

    isChecked = id =>
        (this.props.checked[this.props.iface_kind] && this.props.checked[this.props.iface_kind][id]) || false;

    isAnyChecked = () => this.currentKindInterfaces().some(iface => this.isChecked(iface.id));

    areAllChecked = () => this.currentKindInterfaces().every(iface => this.isChecked(iface.id));

    checkAll = () => {
        const value = !this.areAllChecked();
        let checked = JSON.parse(JSON.stringify(this.props.checked));
        checked[this.props.iface_kind] || (checked[this.props.iface_kind] = {});
        this.currentKindInterfaces().map(iface => (checked[this.props.iface_kind][iface.id] = value));
        this.props.setChecked(checked);
    };

    render() {
        if (!this.currentKindInterfaces()) {
            return null;
        }

        const t = this.props.t;

        const Interfaces = (
            <BoxContent>
                <ButtonGroup className="pull-right">
                    <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
                        <Button icon="trash" disabled={!this.isAnyChecked()}>
                            {t('DeleteSelected') + t(this.props.iface_kind)}
                        </Button>
                        <div>
                            {t('ConfirmRemoveInterfaces') + t(this.props.iface_kind) + '?'}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 27 }}>
                                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                                    {t('ButtonCancel')}
                                </Button>
                                <Button
                                    intent={Intent.DANGER}
                                    className={Classes.POPOVER_DISMISS}
                                    onClick={this.deleteSelected}
                                >
                                    {t('ButtonDelete')}
                                </Button>
                            </div>
                        </div>
                    </Popover>

                    <Button icon="refresh" title={t('Refresh')} onClick={() => this.getInterfaces()} />
                </ButtonGroup>
                <HTMLTable condensed={true} interactive={true} style={{ marginLeft: 24 }} className="iface-list">
                    <thead>
                        <tr>
                            <td>
                                <Checkbox
                                    style={{ margin: 0 }}
                                    checked={this.areAllChecked()}
                                    onChange={this.checkAll}
                                />
                            </td>
                            {columns[this.props.iface_kind].map(column => (
                                <td>
                                    <Fg text={t('ColumnHeader-' + column)} />
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {this.currentKindInterfaces().map(iface => (
                            <tr key={iface.name + iface.id}>
                                <td>
                                    <Checkbox
                                        style={{ marginBottom: 0 }}
                                        onChange={this.onCheckChange.bind(null, iface.id)}
                                        checked={this.isChecked(iface.id)}
                                    />
                                </td>
                                {columns[this.props.iface_kind].map(column => (
                                    <td className="iface-cell">
                                        <Fg text={iface[column]} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </BoxContent>
        );

        return (
            <Box>
                <Tabs
                    id="DeleteInterfacesTabs"
                    onChange={this.onInterfaceKindChange}
                    selectedTabId={this.props.iface_kind}
                    renderActiveTabPanelOnly
                    className={'fullHeightTabs'}
                >
                    <Tab id="workflows" title={t('Workflows')} panel={Interfaces} />
                    <Tab id="services" title={t('Services')} panel={Interfaces} />
                    <Tab id="jobs" title={t('Jobs')} panel={Interfaces} />
                    <Tab id="steps" title={t('Steps')} panel={Interfaces} />
                    <Tab id="classes" title={t('Classes')} panel={Interfaces} />
                    <Tab id="mappers" title={t('Mappers')} panel={Interfaces} />
                </Tabs>
            </Box>
        );
    }
}

const mapStateToProps = state => ({
    iface_kind: state.delete_ifaces_kind,
    interfaces: state.delete_ifaces_all,
    checked: state.delete_ifaces_checked,
});

const mapDispatchToProps = dispatch => ({
    setIfaceKind: iface_kind => dispatch({ type: 'delete_ifaces_kind', delete_ifaces_kind: iface_kind || 'workflows' }),
    setInterfaces: interfaces => dispatch({ type: 'delete_ifaces_all', delete_ifaces_all: interfaces || {} }),
    setChecked: checked => dispatch({ type: 'delete_ifaces_checked', delete_ifaces_checked: checked || {} }),
});

export const DeleteInterfacesContainer = compose(
    connect(mapStateToProps, mapDispatchToProps),
    withTextContext()
)(DeleteInterfaces);
