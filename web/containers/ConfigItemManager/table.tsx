// @flow
import React from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { ActionColumnHeader, ActionColumn } from '../../components/ActionColumn';
import DataOrEmptyTable from '../../components/DataOrEmptyTable';
import { Table, Thead, Tr, Th, Tbody, Td, FixedRow } from '../../components/Table';
import Pull from '../../components/Pull';
import ContentByType from '../../components/ContentByType';
//import ConfigItemsModal from './modal';
import Tree from '../../components/Tree';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import mapProps from 'recompose/mapProps';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import size from 'lodash/size';
import { ButtonGroup, Button, Icon } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import Modal from './modal';

type ConfigItemsTableProps = {
    items: Object;
    dispatchAction: Function;
    intrf: string;
    openModal: Function;
    closeModal: Function;
    onSubmit: Function;
    belongsTo: string;
    showDescription: boolean;
    levelType: string;
    stepId?: number;
};

const ConfigItemsTable: Function = (props: ConfigItemsTableProps) => (
    <React.Fragment>
        {props.isGrouped && size(props.data) ? (
            map(props.data, (configItemsData, groupName) => (
                <>
                    <br />
                    <ItemsTable {...props} groupName={groupName} configItemsData={configItemsData} title={groupName} />
                    <br />
                </>
            ))
        ) : (
            <ItemsTable {...props} configItemsData={props.configItems.data} />
        )}
        {props.modalData && (
            <Modal
                onClose={props.handleModalToggle}
                item={{ ...props.modalData.item }}
                onSubmit={props.modalData.onSubmit}
                intrf={props.modalData.intrf}
                levelType={props.modalData.levelType}
            />
        )}
    </React.Fragment>
);

let ItemsTable: Function = ({
    onSubmit,
    intrf,
    showDescription,
    handleToggleDescription,
    levelType,
    configItemsData,
    title,
    groupName,
    handleModalToggle,
    handleGroupedToggle,
    t,
}: ConfigItemsTableProps) => (
    <React.Fragment>
        <Table striped condensed fixed hover>
            <Thead>
                <FixedRow className="toolbar-row">
                    <Th>
                        {groupName && (
                            <Pull>
                                <h3 style={{ margin: 0, padding: 0, lineHeight: '30px' }}>
                                    <Icon icon="group-objects" /> {t('Group')}: {groupName}
                                </h3>
                            </Pull>
                        )}
                        <Pull right>
                            <ButtonGroup>
                                <Button
                                    text={t(groupName ? 'button.ungroup' : 'button.group-up')}
                                    icon={groupName ? 'ungroup-objects' : 'group-objects'}
                                    onClick={handleGroupedToggle}
                                />
                                <Button
                                    text={t('button.show-descriptions')}
                                    icon="align-left"
                                    onClick={handleToggleDescription}
                                />
                            </ButtonGroup>
                        </Pull>
                    </Th>
                </FixedRow>
                <FixedRow>
                    <Th className="name text" iconName="application">
                        {t('Name')}
                    </Th>
                    <ActionColumnHeader icon="edit" />
                    <Th className="text" iconName="info-sign">
                        {t('Value')}
                    </Th>
                    <Th>{t('Local')}</Th>
                    <Th>{t('Level')}</Th>
                    {!title && <Th name="config_group">{t('Group')}</Th>}
                    <Th iconName="code" />
                </FixedRow>
            </Thead>
            <DataOrEmptyTable condition={!configItemsData || configItemsData.length === 0} cols={7} small>
                {props => (
                    <Tbody {...props}>
                        {configItemsData.map((item: any, index: number) => (
                            <React.Fragment>
                                <Tr
                                    key={item.name}
                                    first={index === 0}
                                    className={classnames({
                                        'row-alert': !item.value && !item.is_set,
                                    })}
                                >
                                    <Td className="name">{item.name}</Td>
                                    <ActionColumn>
                                        <ButtonGroup>
                                            <Button
                                                small
                                                icon="edit"
                                                title={t('button.edit-this-value')}
                                                onClick={() => {
                                                    handleModalToggle(
                                                        { ...item },
                                                        (name, value, parent) => {
                                                            onSubmit(name, value, parent, 'local');
                                                            handleModalToggle(null);
                                                        },
                                                        intrf,
                                                        levelType
                                                    );
                                                }}
                                            />
                                            <Button
                                                small
                                                icon="cross"
                                                title={t('button.remove-this-value')}
                                                disabled={item.level ? !item.level.startsWith(levelType || '') : true}
                                                onClick={() => {
                                                    onSubmit(item.name, null, item.parent_class, 'local', true);
                                                }}
                                            />
                                        </ButtonGroup>
                                    </ActionColumn>
                                    <Td className={`text ${item.level === 'workflow' || item.level === 'global'}`}>
                                        {!item.isTemplatedString &&
                                        (item.type === 'hash' ||
                                            item.type === 'list' ||
                                            item.type === '*hash' ||
                                            item.type === '*list') ? (
                                            <Tree compact data={item.value} />
                                        ) : (
                                            <ContentByType inTable content={item.value} />
                                        )}
                                    </Td>
                                    <Td className="narrow">
                                        <ContentByType content={item.strictly_local} />
                                    </Td>
                                    <Td className="medium">{item.level}</Td>
                                    {!title && <Td className="medium">{item.config_group}</Td>}
                                    <Td className="narrow">{`<${item.type}/>`}</Td>
                                </Tr>
                                {showDescription && (
                                    <Tr>
                                        <Td className="text" colspan={groupName ? 6 : 7}>
                                            {item.description}
                                        </Td>
                                    </Tr>
                                )}
                            </React.Fragment>
                        ))}
                    </Tbody>
                )}
            </DataOrEmptyTable>
        </Table>
    </React.Fragment>
);

ItemsTable = compose(
    withState('showDescription', 'toggleDescription', false),
    withHandlers({
        handleToggleDescription: ({ toggleDescription }) => () => {
            toggleDescription(value => !value);
        },
    }),
    withTextContext()
)(ItemsTable);

export default compose(
    withState('modalData', 'toggleModalData', null),
    withState('isGrouped', 'setIsGrouped', true),
    withHandlers({
        handleModalToggle: ({ toggleModalData }) => (item, onSubmit, intrf, levelType) => {
            toggleModalData(value =>
                value
                    ? null
                    : {
                          item,
                          onSubmit,
                          intrf,
                          levelType,
                      }
            );
        },
        handleGroupedToggle: ({ setIsGrouped }) => () => {
            setIsGrouped(value => !value);
        },
    }),
    mapProps(({ configItems, ...rest }) => ({
        data: reduce(
            configItems.data,
            (newItems, item) => {
                // Check if this group exists
                if (!newItems[item.config_group]) {
                    newItems[item.config_group] = [];
                }
                // Push the item
                newItems[item.config_group].push(item);
                return newItems;
            },
            {}
        ),
        configItems,
        ...rest,
    })),
    onlyUpdateForKeys(['configItems', 'showDescription', 'isGrouped', 'modalData'])
)(ConfigItemsTable);
