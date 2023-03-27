import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTable,
  ReqoreTag,
  ReqoreVerticalSpacer
} from '@qoretechnologies/reqore';
import {
  IReqoreTableColumn,
  IReqoreTableProps
} from '@qoretechnologies/reqore/dist/components/Table';
import size from 'lodash/size';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import styled from 'styled-components';
import withTextContext from '../../hocomponents/withTextContext';
import AddConfigItemModal from './modal';
import { Value } from './table';

export const StyledTable: React.FC<IReqoreTableProps> = styled(
  ReqoreTable && typeof ReqoreTable === 'object' ? ReqoreTable : 'div'
)`
  .reqore-table-body {
    height: unset !important;
  }
`;

export const WorkflowConfigItemsTable: Function = ({
  globalConfig,
  onSubmit,
  globalItems,
  initialItems,
  modalData,
  handleModalToggle,
  workflow,
  t,
  definitionsOnly,
}) => {
  const isInitialItemValueSame = (item) => {
    const initialItem = initialItems.find(
      (inItem) => inItem.name === item.name && inItem.group === item.group
    );

    if (!initialItem) {
      return false;
    }

    return initialItem.value === item.value;
  };

  const columns = () => {
    let cols: IReqoreTableColumn[] = [
      {
        dataId: 'name',
        header: t('Name'),
        sortable: true,
        cellTooltip: (data) => {
          return data.name;
        },
      },
    ];

    cols = [
      ...cols,
      {
        dataId: 'value',
        header: t('Value'),
        sortable: true,
        cellTooltip(data) {
          return (
            <>
              <ReqoreMessage intent="info" size="small">
                <ReactMarkdown>{data.description}</ReactMarkdown>
              </ReqoreMessage>
              <ReqoreVerticalSpacer height={10} />
              <Value item={data} />
            </>
          );
        },
      },
      {
        dataId: 'type',
        header: t('Type'),
        sortable: true,
        width: 200,
        align: 'center',
        content: ({ type, can_be_undefined }) => (
          <ReqoreTag size="small" icon="CodeLine" label={`${can_be_undefined ? '*' : ''}${type}`} />
        ),
      },

      {
        dataId: '_actions',
        header: t('Actions'),
        width: 150,
        align: 'center',
        content: (item) => (
          <ReqoreControlGroup stack size="small">
            <ReqoreButton
              icon="EditLine"
              tooltip={t('button.edit-this-value')}
              disabled={definitionsOnly}
              onClick={() => {
                handleModalToggle({
                  onSubmit: (name, value, parent, isTemplatedString, remove, currentType) => {
                    onSubmit(
                      name,
                      value,
                      parent,
                      workflow ? 'workflow' : 'global',
                      isTemplatedString,
                      remove,
                      currentType
                    );
                    handleModalToggle(null);
                  },
                  globalConfig: globalItems,
                  item,
                  isGlobal: true,
                });
              }}
            />
            <ReqoreButton
              icon="CloseLine"
              intent={'warning'}
              tooltip={t('button.remove-this-value')}
              disabled={definitionsOnly}
              onClick={() => {
                onSubmit(
                  item.name,
                  null,
                  item.parent_class,
                  workflow ? 'workflow' : 'global',
                  item.is_templated_string,
                  true
                );
              }}
            />
          </ReqoreControlGroup>
        ),
      },
    ];

    return cols;
  };

  return (
    <>
      {modalData && (
        <AddConfigItemModal
          onClose={handleModalToggle}
          item={modalData.item && { ...modalData.item }}
          onSubmit={modalData.onSubmit}
          globalConfig={modalData.globalConfig}
          isGlobal={modalData.isGlobal}
        />
      )}
      {globalConfig && globalConfig.length !== 0 ? (
        <ReqorePanel
          label={`${t(workflow ? 'Workflow' : 'Global')} ${t('ConfigItemValues')}`}
          minimal
          transparent
          flat
          collapsible
          icon={'Settings3Fill'}
          actions={[
            {
              disabled: !size(globalItems),
              icon: 'AddLine',
              label: t('button.add-new-value'),
              tooltip: t('button.add-new-value'),
              onClick: () => {
                handleModalToggle({
                  onSubmit: (name, value, parent, isTemplatedString) => {
                    onSubmit(
                      name,
                      value,
                      parent,
                      workflow ? 'workflow' : 'global',
                      isTemplatedString
                    );
                    handleModalToggle(null);
                  },
                  globalConfig: globalItems,
                  isGlobal: true,
                });
              },
            },
          ]}
        >
          <StyledTable
            rounded
            striped
            sort={{
              by: 'name',
              direction: 'asc',
            }}
            columns={columns()}
            data={globalConfig.map((item) => ({
              ...item,
              _intent: !isInitialItemValueSame(item) ? 'success' : undefined,
            }))}
          />
        </ReqorePanel>
      ) : null}

      <ReqoreVerticalSpacer height={10} />
    </>
  );
};

export default compose(
  mapProps(({ configItems, ...rest }) => ({
    globalConfig: configItems.filter((configItem) => configItem.is_set),
    globalItems: configItems.filter((configItem) => !configItem.is_set),
    configItems,
    ...rest,
  })),
  withState('modalData', 'toggleModalData', null),
  withHandlers({
    handleModalToggle:
      ({ toggleModalData }) =>
      (options) => {
        toggleModalData((value) =>
          value
            ? null
            : {
                ...options,
              }
        );
      },
  }),
  withTextContext(),
  onlyUpdateForKeys(['configItems', 'showDescription', 'globalConfig', 'modalData'])
)(WorkflowConfigItemsTable);
