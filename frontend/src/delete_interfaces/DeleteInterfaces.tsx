import { Intent } from '@blueprintjs/core';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTable,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { vscode } from '../common/vscode';
import withInitialDataConsumer from '../hocomponents/withInitialDataConsumer';
import withTextContext from '../hocomponents/withTextContext';

const columnsList = {
  workflows: ['name', 'version', 'workflowid', 'description'],
  services: ['name', 'version', 'serviceid', 'description'],
  jobs: ['name', 'version', 'jobid', 'description'],
  steps: ['name', 'version', 'stepid', 'description'],
  classes: ['name', 'version', 'classid', 'description', 'language'],
  mappers: ['name', 'version', 'mapperid', 'desc', 'type'],
};

const columns = {
  workflows: [
    { dataId: 'name', grow: 2 },
    { dataId: 'version', width: 80, content: 'tag', align: 'center' },
    { dataId: 'workflowid', width: 80, content: 'tag', align: 'center' },
    { dataId: 'description', cellTooltip: ({ description }) => description },
  ],
  services: [
    { dataId: 'name', grow: 2 },
    { dataId: 'version', width: 80, content: 'tag', align: 'center' },
    { dataId: 'serviceid', width: 80, content: 'tag', align: 'center' },
    { dataId: 'description', cellTooltip: ({ description }) => description },
  ],
  jobs: [
    { dataId: 'name', grow: 2 },
    { dataId: 'version', width: 80, content: 'tag', align: 'center' },
    { dataId: 'jobid', width: 80, content: 'tag', align: 'center' },
    { dataId: 'description', cellTooltip: ({ description }) => description },
  ],
  steps: [
    { dataId: 'name', grow: 2 },
    { dataId: 'version', width: 80, content: 'tag', align: 'center' },
    { dataId: 'stepid', width: 80, content: 'tag', align: 'center' },
    { dataId: 'description', cellTooltip: ({ description }) => description },
  ],
  classes: [
    { dataId: 'name', grow: 2 },
    { dataId: 'version', width: 80, content: 'tag', align: 'center' },
    { dataId: 'classid', width: 80, content: 'tag', align: 'center' },
    { dataId: 'description', cellTooltip: ({ description }) => description },
    { dataId: 'language', content: 'tag', align: 'center' },
  ],
  mappers: [
    { dataId: 'name', grow: 2 },
    { dataId: 'version', width: 80, content: 'tag', align: 'center' },
    { dataId: 'mapperid', width: 80, content: 'tag', align: 'center' },
    { dataId: 'description', cellTooltip: ({ description }) => description },
    { dataId: 'type ', content: 'tag', align: 'center' },
  ],
};

const tabs = [
  {
    id: 'workflows',
    label: `Workflows`,
  },
  {
    id: 'services',
    label: `Services`,
  },
  {
    id: 'jobs',
    label: `Jobs`,
  },
  {
    id: 'steps',
    label: `Steps`,
  },
  {
    id: 'classes',
    label: `Classes`,
  },
  {
    id: 'mappers',
    label: `Mappers`,
  },
];

class DeleteInterfaces extends Component {
  constructor() {
    super();

    window.addEventListener('message', (event) => {
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
    vscode.postMessage({
      action: 'delete-interfaces',
      iface_kind: this.props.iface_kind,
      ids: this.props.checked,
    });
    this.props.setChecked([]);
  };

  onInterfaceKindChange = (iface_kind) => {
    this.props.setIfaceKind(iface_kind);
    if (!this.props.interfaces[iface_kind]) {
      this.getInterfaces(iface_kind);
    }
    this.props.setChecked([]);
  };

  componentDidMount() {
    if (this.props.initialData.qorus_instance) {
      this.getInterfaces();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.initialData.qorus_instance !== this.props.initialData.qorus_instance &&
      nextProps.initialData.qorus_instance
    ) {
      this.getInterfaces();
    }
  }

  currentKindInterfaces = () => this.props.interfaces[this.props.iface_kind];

  getInterfaces = (iface_kind = this.props.iface_kind) => {
    vscode.postMessage({
      action: 'get-interfaces',
      iface_kind: iface_kind,
      columns: columnsList[iface_kind],
    });
  };

  renderInterfaces = () => (
    <>
      <ReqoreTable
        selectable
        fill
        selected={this.props.checked}
        onSelectedChange={(selected) => {
          this.props.setChecked(selected);
        }}
        sort={{
          by: 'name',
          direction: 'asc',
        }}
        columns={columns[this.props.iface_kind].map((column) => ({
          ...column,
          header: this.props.t('ColumnHeader-' + column.dataId),
        }))}
        data={this.currentKindInterfaces().map((iface) => ({
          ...iface,
          _selectId: iface.id,
        }))}
      />
    </>
  );

  render() {
    const t = this.props.t;

    return (
      <ReqorePanel
        label="Interface management"
        minimal
        transparent
        flat
        fill
        contentStyle={{ overflow: 'hidden' }}
        actions={[
          {
            icon: 'RefreshLine',
            tooltip: t('Refresh'),
            label: 'Refresh',
            onClick: () => this.getInterfaces(),
            show: this.props.initialData.qorus_instance ? true : false,
          },
          {
            label: `${t('DeleteSelected')} ${t(this.props.iface_kind)}`,
            icon: 'DeleteBinLine',
            intent: 'danger',
            show: size(this.props.checked) === 0 ? false : true,
            minimal: true,
            tooltip: {
              handler: 'click',
              content: (
                <>
                  {t('ConfirmRemoveInterfaces') + t(this.props.iface_kind) + '?'}
                  <ReqoreVerticalSpacer height={10} />
                  <ReqoreControlGroup fluid>
                    <ReqoreButton
                      icon="DeleteBinLine"
                      intent={Intent.DANGER}
                      onClick={this.deleteSelected}
                    >
                      {t('ButtonDelete')}
                    </ReqoreButton>
                  </ReqoreControlGroup>
                </>
              ),
            },
          },
        ]}
      >
        {!this.props.initialData.qorus_instance ? (
          <ReqoreMessage intent="warning">
            No Qorus instance is connected. Please connect to a Qorus instance to use this feature.
          </ReqoreMessage>
        ) : !this.currentKindInterfaces() ? (
          <ReqoreMessage intent="pending" minimal>
            Loading interfaces
          </ReqoreMessage>
        ) : (
          <>
            <ReqoreMessage intent="info">
              No Qorus instance is connected. Please connect to a Qorus instance to use this
              feature.
            </ReqoreMessage>
            <ReqoreTabs
              padded={false}
              tabsPadding="vertical"
              onTabChange={this.onInterfaceKindChange}
              activeTab={this.props.iface_kind}
              activeTabIntent="info"
              tabs={tabs}
              fillParent
            >
              {tabs.map((tab, index) => (
                <ReqoreTabsContent tabId={tab.id} key={index}>
                  {this.renderInterfaces()}
                </ReqoreTabsContent>
              ))}
            </ReqoreTabs>
          </>
        )}
      </ReqorePanel>
    );
  }
}

const mapStateToProps = (state) => ({
  iface_kind: state.delete_ifaces_kind,
  interfaces: state.delete_ifaces_all,
  checked: state.delete_ifaces_checked,
});

const mapDispatchToProps = (dispatch) => ({
  setIfaceKind: (iface_kind) =>
    dispatch({ type: 'delete_ifaces_kind', delete_ifaces_kind: iface_kind || 'workflows' }),
  setInterfaces: (interfaces) =>
    dispatch({ type: 'delete_ifaces_all', delete_ifaces_all: interfaces || {} }),
  setChecked: (checked) =>
    dispatch({ type: 'delete_ifaces_checked', delete_ifaces_checked: checked || {} }),
});

export const DeleteInterfacesContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTextContext(),
  withInitialDataConsumer()
)(DeleteInterfaces);
