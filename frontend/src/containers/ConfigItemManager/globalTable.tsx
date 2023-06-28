import {
  ReqoreCollection,
  ReqoreTable,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { IReqoreTableProps } from '@qoretechnologies/reqore/dist/components/Table';
import size from 'lodash/size';
import React from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import styled from 'styled-components';
import withTextContext from '../../hocomponents/withTextContext';
import AddConfigItemModal from './modal';
import { Value, zoomToSize, zoomToWidth } from './table';

const StyledTable: React.FC<IReqoreTableProps> = styled(ReqoreTable)`
  .reqore-table-body {
    height: unset !important;
  }
`;

const WorkflowConfigItemsTable: Function = ({
  globalConfig,
  onSubmit,
  globalItems,
  initialItems,
  modalData,
  handleModalToggle,
  workflow,
  t,
  definitionsOnly,
  zoom,
  itemsPerPage,
  query,
}) => {
  const isInitialItemValueSame = (item) => {
    const initialItem = initialItems.find(
      (inItem) => inItem.name === item.name && inItem.config_group === item.config_group
    );

    if (!initialItem) {
      return false;
    }

    return initialItem.value === item.value;
  };

  const items = globalConfig.filter((item) => {
    if (query) {
      return (
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    return item;
  });

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
        <>
          <ReqoreCollection
            label={`${t(workflow ? 'Workflow' : 'Global')} ${t('ConfigItemValues')}`}
            sortable
            icon="PriceTagFill"
            maxItemHeight={250}
            minColumnWidth={zoomToWidth[zoom]}
            responsiveActions={false}
            responsiveTitle
            collapsible
            inputInTitle={false}
            inputProps={{
              fluid: true,
            }}
            emptyMessage={`No global config items found ${query ? `for query "${query}"` : ''}`}
            paging={
              itemsPerPage
                ? {
                    infinite: true,
                    loadMoreLabel: 'Load more...',
                    showLabels: true,
                    itemsPerPage,
                  }
                : undefined
            }
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
            items={items.map(
              (item): IReqoreCollectionItemProps => ({
                label: item.name,
                size: zoomToSize[zoom],
                tooltip: {
                  content: item.description,
                  delay: 300,
                },
                intent:
                  !item.value && !item.is_set
                    ? 'danger'
                    : !isInitialItemValueSame(item)
                    ? 'success'
                    : undefined,
                onClick: definitionsOnly
                  ? undefined
                  : () => {
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
                    },
                actions: [
                  {
                    icon: 'CloseLine',
                    tooltip: 'Clear',
                    intent: 'warning',
                    disabled: definitionsOnly,
                    show: 'hover',
                    onClick: () => {
                      onSubmit(
                        item.name,
                        null,
                        item.parent_class,
                        workflow ? 'workflow' : 'global',
                        item.is_templated_string,
                        true
                      );
                    },
                  },
                ],
                content: (
                  <>
                    <Value item={item} />
                    <ReqoreVerticalSpacer height={15} />
                    <ReqoreTagGroup size={zoomToSize[zoom]}>
                      {item.parent_class ? (
                        <ReqoreTag labelKey="Parent" icon="CodeBoxFill" label={item.parent_class} />
                      ) : null}
                      <ReqoreTag labelKey="Type" label={item.type} icon="CodeLine" />
                    </ReqoreTagGroup>
                  </>
                ),
              })
            )}
          />
        </>
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
