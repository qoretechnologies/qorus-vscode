import React, { FunctionComponent, useEffect, useState } from 'react';

import useEffectOnce from 'react-use/lib/useEffectOnce';
import compose from 'recompose/compose';
import styled from 'styled-components';

import { Button } from '@blueprintjs/core';

import { TTranslator } from '../../App';
import CustomDialog from '../../components/CustomDialog';
import { Messages } from '../../constants/messages';
import { getTypeFromValue, maybeParseYaml } from '../../helpers/validations';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import InterfaceCreatorPanel from '../InterfaceCreator/panel';
import GlobalTable from './globalTable';
import ConfigItemsTable from './table';

export interface IConfigItemManager {
    t: TTranslator;
    type: string;
    postMessage: TPostMessage;
    addMessageListener: TMessageListener;
    baseClassName: string;
    interfaceId: string;
    definitionsOnly?: boolean;
    disableAdding?: boolean;
}

const StyledConfigManagerWrapper = styled.div`
    height: 100%;
    padding: 20px 20px 0 20px;
`;

const StyledConfigWrapper = styled.div`
    display: flex;
    flex-flow: row;
    flex: auto;
    height: 100%;
    padding: 20px 20px 0 20px;
    overflow: hidden;
`;

export const StyledSeparator = styled.hr`
    border: 0;
    border-bottom: 1px solid #eee;
    margin: 10px 0;
`;

const ConfigItemManager: FunctionComponent<IConfigItemManager> = ({
    t,
    type,
    baseClassName,
    postMessage,
    addMessageListener,
    classes,
    interfaceId,
    resetFields,
    steps,
    definitionsOnly,
    stateData,
    disableAdding,
}) => {
    const [showConfigItemPanel, setShowConfigItemPanel] = useState<boolean>(false);
    const [configItemData, setConfigItemData] = useState<any>(false);
    const [configItems, setConfigItems] = useState<any>({});

    useEffectOnce(() => {
        addMessageListener(Messages.RETURN_CONFIG_ITEMS, (data) => {
            console.log(data);
            setConfigItems(data);
        });
        // Listen for config items data request
        // and open the fields editing
        addMessageListener(Messages.RETURN_CONFIG_ITEM, ({ item }) => {
            // Transform the type of the CI
            if (item.type.startsWith('*')) {
                item.type = item.type.replace('*', '');
                item.can_be_undefined = true;
            }
            // Set the config data
            setConfigItemData(item);
        });
        // Ask for the config items
        postMessage(Messages.GET_CONFIG_ITEMS, {
            'base-class-name': baseClassName,
            classes,
            iface_id: interfaceId,
            iface_kind: type,
            steps,
            state_data: stateData,
        });
    });

    useEffect(() => {
        // Check if there are any data
        if (configItemData) {
            // Open the config item panel
            setShowConfigItemPanel(true);
        } else {
            setShowConfigItemPanel(false);
            resetFields && resetFields('config-item');
        }
    }, [configItemData]);

    const handleSubmit: (
        name: string,
        value: string,
        parent: string | null,
        level: string,
        remove?: boolean
    ) => void = (name, value, parent, level, isTemplatedString, remove) => {
        // Send message that the config item has been updated
        postMessage(Messages.UPDATE_CONFIG_ITEM_VALUE, {
            name,
            value,
            value_true_type: getTypeFromValue(maybeParseYaml(value)),
            file_name: configItems.file_name,
            remove,
            level,
            iface_id: interfaceId,
            parent_class: parent,
            iface_kind: type,
            is_templated_string: isTemplatedString,
            state_id: stateData.id,
        });
    };

    const handleEditStructureClick: (configItemName: string) => void = (configItemName) => {
        // Request the config item data
        postMessage(Messages.GET_CONFIG_ITEM, {
            iface_id: interfaceId,
            name: configItemName,
            iface_kind: type,
            state_id: stateData.id,
        });
    };

    const handleDeleteStructureClick: (configItemName: string) => void = (configItemName) => {
        // Request the config item data
        postMessage(Messages.DELETE_CONFIG_ITEM, {
            iface_id: interfaceId,
            name: configItemName,
            iface_kind: type,
            state_id: stateData.id,
        });
    };

    return (
        <>
            <StyledConfigManagerWrapper>
                {type !== 'workflow' && !disableAdding ? (
                    <Button
                        name={'add-config-item'}
                        text={t('AddConfigItem')}
                        intent="success"
                        icon="add"
                        onClick={() => setShowConfigItemPanel(true)}
                    />
                ) : null}
                <StyledSeparator />
                <div>
                    {configItems.global_items && (
                        <GlobalTable
                            definitionsOnly={definitionsOnly}
                            configItems={configItems.global_items}
                            onSubmit={handleSubmit}
                        />
                    )}
                    {(type === 'step' || type === 'workflow') && configItems.workflow_items ? (
                        <GlobalTable
                            definitionsOnly={definitionsOnly}
                            configItems={configItems.workflow_items}
                            workflow
                            onSubmit={handleSubmit}
                        />
                    ) : null}
                    {configItems.items && type !== 'workflow' ? (
                        <ConfigItemsTable
                            configItems={{
                                data: configItems.items,
                            }}
                            definitionsOnly={definitionsOnly}
                            onEditStructureClick={handleEditStructureClick}
                            onDeleteStructureClick={handleDeleteStructureClick}
                            onSubmit={handleSubmit}
                            disableAdding={disableAdding}
                            type={type}
                        />
                    ) : null}
                </div>
            </StyledConfigManagerWrapper>
            {showConfigItemPanel && (
                <CustomDialog
                    isOpen
                    title={t('ConfigItemEditor')}
                    style={{ width: '80vw', height: '80vh', backgroundColor: '#fff' }}
                    onClose={() => {
                        setConfigItemData(null);
                        setShowConfigItemPanel(false);
                        resetFields && resetFields('config-item');
                    }}
                >
                    <StyledConfigWrapper>
                        <InterfaceCreatorPanel
                            fileName={configItems.file_name}
                            parent={type}
                            type={'config-item'}
                            initialInterfaceId={interfaceId}
                            data={configItemData}
                            disabledFields={configItemData && configItemData.parent && ['name']}
                            isEditing={!!configItemData}
                            onSubmitSuccess={() => {
                                setConfigItemData(null);
                                setShowConfigItemPanel(false);
                                resetFields && resetFields('config-item');
                            }}
                            forceSubmit
                        />
                    </StyledConfigWrapper>
                </CustomDialog>
            )}
        </>
    );
};

export default compose(withTextContext(), withMessageHandler())(ConfigItemManager);
