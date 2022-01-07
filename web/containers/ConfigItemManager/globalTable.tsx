// @flowa
import { Button, ButtonGroup, Intent } from '@blueprintjs/core';
import size from 'lodash/size';
import React from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import styled from 'styled-components';
import { StyledSeparator } from '.';
import { ActionColumn, ActionColumnHeader } from '../../components/ActionColumn';
import DataOrEmptyTable from '../../components/DataOrEmptyTable';
import Pull from '../../components/Pull';
import { FixedRow, Table, Tbody, Td, Th, Thead, Tr } from '../../components/Table';
import withTextContext from '../../hocomponents/withTextContext';
import AddConfigItemModal from './modal';
import { Value } from './table';

const StyledToolbarRow = styled.div`
  clear: both;
  margin-bottom: 5px;
  margin-top: 5px;
  overflow: hidden;
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
      <StyledToolbarRow>
        <Pull>
          <h3 style={{ margin: 0, padding: 0 }}>
            {t(workflow ? 'Workflow' : 'Global')} {t('ConfigItemValues')}
          </h3>
        </Pull>
        <Pull right>
          <ButtonGroup>
            <Button
              disabled={!size(globalItems)}
              icon="add"
              text={t('button.add-new-value')}
              title={t('button.add-new-value')}
              onClick={() => {
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
              }}
            />
          </ButtonGroup>
        </Pull>
      </StyledToolbarRow>
      {globalConfig && globalConfig.length !== 0 ? (
        <Table striped condensed fixed hover>
          <Thead>
            <FixedRow>
              <Th className="name" icon="application">
                {t('Name')}
              </Th>
              {!definitionsOnly && <ActionColumnHeader />}
              <Th className="text" iconName="info-sign">
                {t('Name')}
              </Th>
              <Th iconName="code" />
            </FixedRow>
          </Thead>

          <DataOrEmptyTable
            condition={!globalConfig || globalConfig.length === 0}
            cols={definitionsOnly ? 3 : 4}
            small
          >
            {(props) => (
              <Tbody {...props}>
                {globalConfig.map((item: any, index: number) => (
                  <React.Fragment>
                    <Tr
                      key={item.name}
                      first={index === 0}
                      highlight={!isInitialItemValueSame(item)}
                    >
                      <Td className="name">{item.name}</Td>
                      {!definitionsOnly && (
                        <ActionColumn>
                          <ButtonGroup>
                            <Button
                              icon="edit"
                              small
                              title={t('button.edit-this-value')}
                              onClick={() => {
                                handleModalToggle({
                                  onSubmit: (
                                    name,
                                    value,
                                    parent,
                                    isTemplatedString,
                                    remove,
                                    currentType
                                  ) => {
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
                            <Button
                              small
                              icon="trash"
                              title={t('button.remove-this-value')}
                              intent={Intent.DANGER}
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
                          </ButtonGroup>
                        </ActionColumn>
                      )}
                      <Td
                        className={`text ${item.level === 'workflow' || item.level === 'global'}`}
                        style={{ position: 'relative' }}
                      >
                        <Value item={item} />
                      </Td>
                      <Td className="narrow">{`<${item.can_be_undefined ? '*' : ''}${
                        item.type
                      }/>`}</Td>
                    </Tr>
                  </React.Fragment>
                ))}
              </Tbody>
            )}
          </DataOrEmptyTable>
        </Table>
      ) : null}
      <StyledSeparator />
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
