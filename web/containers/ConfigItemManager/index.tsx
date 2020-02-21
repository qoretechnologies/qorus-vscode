import React, { FunctionComponent, useState, useEffect } from 'react';
import { Button, Dialog } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import InterfaceCreatorPanel from '../InterfaceCreator/panel';
import styled from 'styled-components';
import ConfigItemsTable from './table';
import GlobalTable from './globalTable';
import withMessageHandler, { TPostMessage, TMessageListener } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { FieldName } from '../../components/FieldSelector';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';

export interface IConfigItemManager {
    t: TTranslator;
    type: string;
    postMessage: TPostMessage;
    addMessageListener: TMessageListener;
    baseClassName: string;
    interfaceId: string;
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
}) => {
    const [showConfigItemPanel, setShowConfigItemPanel] = useState<boolean>(false);
    const [configItemData, setConfigItemData] = useState<any>(false);
    const [configItems, setConfigItems] = useState<any>({});

    useEffectOnce(() => {
        addMessageListener(Messages.RETURN_CONFIG_ITEMS, data => {
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
        });
    });

    useEffect(() => {
        // Check if there are any data
        if (configItemData) {
            // Open the config item panel
            setShowConfigItemPanel(true);
        } else {
            setShowConfigItemPanel(false);
            resetFields('config-item');
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
            file_name: configItems.file_name,
            remove,
            level,
            iface_id: interfaceId,
            parent_class: parent,
            iface_kind: type,
            is_templated_string: isTemplatedString,
        });
    };

    const handleEditStructureClick: (configItemName: string) => void = configItemName => {
        // Request the config item data
        postMessage(Messages.GET_CONFIG_ITEM, {
            iface_id: interfaceId,
            name: configItemName,
            iface_kind: type,
        });
    };

    const handleDeleteStructureClick: (configItemName: string) => void = configItemName => {
        // Request the config item data
        postMessage(Messages.DELETE_CONFIG_ITEM, {
            iface_id: interfaceId,
            name: configItemName,
            iface_kind: type,
        });
    };

    return (
        <>
            <StyledConfigManagerWrapper>
                {type !== 'workflow' && (
                    <Button
                        text={t('AddConfigItem')}
                        intent="success"
                        icon="add"
                        onClick={() => setShowConfigItemPanel(true)}
                    />
                )}
                <StyledSeparator />
                <div>
                    {configItems.global_items && (
                        <GlobalTable configItems={configItems.global_items} onSubmit={handleSubmit} />
                    )}
                    {(type === 'step' || type === 'workflow') && configItems.workflow_items ? (
                        <GlobalTable configItems={configItems.workflow_items} workflow onSubmit={handleSubmit} />
                    ) : null}
                    {configItems.items && type !== 'workflow' ? (
                        <ConfigItemsTable
                            configItems={{
                                data: configItems.items,
                            }}
                            onEditStructureClick={handleEditStructureClick}
                            onDeleteStructureClick={handleDeleteStructureClick}
                            onSubmit={handleSubmit}
                            type={type}
                        />
                    ) : null}
                </div>
            </StyledConfigManagerWrapper>
            {showConfigItemPanel && (
                <Dialog
                    isOpen
                    title={t('ConfigItemEditor')}
                    style={{ width: '80vw', height: '80vh', backgroundColor: '#fff' }}
                    onClose={() => {
                        setConfigItemData(null);
                        setShowConfigItemPanel(false);
                        resetFields('config-item');
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
                            onSubmit={() => {
                                setConfigItemData(null);
                                setShowConfigItemPanel(false);
                                resetFields('config-item');
                            }}
                            forceSubmit
                        />
                    </StyledConfigWrapper>
                </Dialog>
            )}
        </>
    );
};

export default compose(withTextContext(), withMessageHandler())(ConfigItemManager);
