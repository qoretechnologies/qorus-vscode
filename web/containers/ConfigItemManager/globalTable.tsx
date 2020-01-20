// @flow
import React from 'react';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import mapProps from 'recompose/mapProps';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import { ActionColumnHeader, ActionColumn } from '../../components/ActionColumn';
import DataOrEmptyTable from '../../components/DataOrEmptyTable';
import { Table, Thead, Tr, Th, Tbody, Td, FixedRow } from '../../components/Table';
import Pull from '../../components/Pull';
import ContentByType from '../../components/ContentByType';
import { ButtonGroup, Button } from '@blueprintjs/core';
import Tree from '../../components/Tree';
import AddConfigItemModal from './modal';
import size from 'lodash/size';
import withTextContext from '../../hocomponents/withTextContext';
import styled from 'styled-components';
import { StyledSeparator } from '.';
import { getItemType } from './table';
import { maybeParseYaml } from '../../helpers/validations';

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
    modalData,
    handleModalToggle,
    workflow,
    t,
}) => (
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
                                onSubmit: (name, value, parent) => {
                                    onSubmit(name, value, parent, workflow ? 'workflow' : 'global');
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
                        <ActionColumnHeader />
                        <Th className="text" iconName="info-sign">
                            {t('Name')}
                        </Th>
                        <Th iconName="code" />
                    </FixedRow>
                </Thead>

                <DataOrEmptyTable condition={!globalConfig || globalConfig.length === 0} cols={4} small>
                    {props => (
                        <Tbody {...props}>
                            {globalConfig.map((item: any, index: number) => (
                                <React.Fragment>
                                    <Tr key={item.name} first={index === 0}>
                                        <Td className="name">{item.name}</Td>
                                        <ActionColumn>
                                            <ButtonGroup>
                                                <Button
                                                    icon="edit"
                                                    small
                                                    title={t('button.edit-this-value')}
                                                    onClick={() => {
                                                        handleModalToggle({
                                                            onSubmit: (name, value, parent) => {
                                                                onSubmit(
                                                                    name,
                                                                    value,
                                                                    parent,
                                                                    workflow ? 'workflow' : 'global'
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
                                                    icon="cross"
                                                    title={t('button.remove-this-value')}
                                                    intent="danger"
                                                    onClick={() => {
                                                        onSubmit(
                                                            item.name,
                                                            null,
                                                            item.parent_class,
                                                            workflow ? 'workflow' : 'global',
                                                            true
                                                        );
                                                    }}
                                                />
                                            </ButtonGroup>
                                        </ActionColumn>
                                        <Td className={`text ${item.level === 'workflow' || item.level === 'global'}`}>
                                            {!item.isTemplatedString &&
                                            (getItemType(item.type, item.value) === 'hash' ||
                                                getItemType(item.type, item.value) === 'list') ? (
                                                <Tree compact data={maybeParseYaml(item.value)} />
                                            ) : (
                                                <ContentByType inTable content={maybeParseYaml(item.value)} />
                                            )}
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

export default compose(
    mapProps(({ configItems, ...rest }) => ({
        globalConfig: configItems.filter(configItem => configItem.is_set),
        globalItems: configItems.filter(configItem => !configItem.is_set),
        configItems,
        ...rest,
    })),
    withState('modalData', 'toggleModalData', null),
    withHandlers({
        handleModalToggle: ({ toggleModalData }) => options => {
            toggleModalData(value =>
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
