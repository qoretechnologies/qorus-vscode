import React, { FunctionComponent, useState } from 'react';
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
`;

const globalData = [
    {
        name: 'Config item 1',
        value: 'test',
        is_set: true,
        type: 'string',
        config_group: 'test',
        yamlData: { value: 'test' },
    },
    {
        name: 'Config item 2',
        value: null,
        type: 'date',
        config_group: 'test',
        yamlData: { value: null },
    },
    {
        name: 'Config item 3',
        value: 'true',
        type: 'any',
        config_group: 'test',
        currentType: 'bool',
        yamlData: { value: 'true' },
    },
    {
        name: 'Config item 4',
        value: 'pepa',
        type: 'string',
        is_set: true,
        default_value: 'heh',
        config_group: 'test',
        yamlData: { value: 'test', allowed_values: ['pepa', 'zdepa', 'sel', 'do', 'sklepa'] },
    },
    {
        name: 'Config item 5',
        value: 'test',
        type: 'string',
        level: 'default',
        config_group: 'test',
        yamlData: { value: 'test' },
    },
];

const workflowData = [
    {
        name: 'Config item 1',
        value: 'test',
        is_set: true,
        type: 'string',
        config_group: 'test',
        yamlData: { value: 'test' },
    },
    {
        name: 'Config item 2',
        value: null,
        type: 'date',
        config_group: 'test',
        yamlData: { value: null },
    },
    {
        name: 'Config item 3',
        value: 'true',
        type: 'any',
        config_group: 'test',
        currentType: 'bool',
        yamlData: { value: 'true' },
    },
    {
        name: 'Config item 4',
        value: 'pepa',
        type: 'string',
        is_set: true,
        default_value: 'heh',
        config_group: 'test',
        yamlData: { value: 'test', allowed_values: ['pepa', 'zdepa', 'sel', 'do', 'sklepa'] },
    },
    {
        name: 'Config item 5',
        value: 'test',
        type: 'string',
        level: 'default',
        config_group: 'test',
        yamlData: { value: 'test' },
    },
];

const data = [
    {
        name: 'Config item 1',
        value: 'test',
        type: 'string',
        local: false,
        level: 'default',
        config_group: 'test',
        yamlData: { value: 'test' },
    },
    {
        name: 'Config item 2',
        value: null,
        type: 'date',
        local: false,
        level: 'default',
        config_group: 'test',
        yamlData: { value: null },
    },
    {
        name: 'Config item 3',
        value: 'true',
        type: 'any',
        local: false,
        level: 'default',
        config_group: 'test',
        currentType: 'bool',
        yamlData: { value: 'true' },
    },
    {
        name: 'Config item 4',
        value: 'pepa',
        type: 'string',
        default_value: 'heh',
        local: false,
        level: 'default',
        config_group: 'maslo',
        yamlData: { value: 'test', allowed_values: ['pepa', 'zdepa', 'sel', 'do', 'sklepa'] },
    },
    {
        name: 'Config item 5',
        value: 'test',
        type: 'string',
        local: false,
        level: 'default',
        config_group: 'test',
        yamlData: { value: 'test' },
    },
];

const ConfigItemManager: FunctionComponent<IConfigItemManager> = ({
    t,
    type,
    baseClassName,
    postMessage,
    addMessageListener,
    interfaceId,
}) => {
    const [showConfigItemPanel, setShowConfigItemPanel] = useState<boolean>(false);
    const [configItems, setConfigItems] = useState<any>({});

    useEffectOnce(() => {
        addMessageListener(Messages.RETURN_CONFIG_ITEMS, data => {
            setConfigItems(data);
        });
        // Ask for the config items
        postMessage(Messages.GET_CONFIG_ITEMS, {
            'base-class-name': baseClassName,
            iface_id: interfaceId,
            iface_kind: type,
        });
    });

    const handleSubmit: (
        name: string,
        value: string,
        parent: string | null,
        level: string,
        remove?: boolean
    ) => void = (name, value, parent, level, remove) => {
        // Send message that the config item has been updated
        postMessage(Messages.UPDATE_CONFIG_ITEM_VALUE, {
            name,
            value,
            file_name: configItems.file_name,
            remove,
            level,
            iface_id: interfaceId,
            parent_class: parent,
        });
    };

    return (
        <>
            <StyledConfigManagerWrapper>
                {<Button text={t('AddConfigItem')} onClick={() => setShowConfigItemPanel(true)} />}
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
                            onSubmit={handleSubmit}
                        />
                    ) : null}
                </div>
            </StyledConfigManagerWrapper>
            {showConfigItemPanel && (
                <Dialog
                    isOpen
                    title={t('ConfigItemEditor')}
                    style={{ width: '80vw', height: '80vh', backgroundColor: '#fff' }}
                    onClose={() => setShowConfigItemPanel(false)}
                >
                    <StyledConfigWrapper>
                        <InterfaceCreatorPanel fileName={configItems.file_name} parent={type} type={'config-item'} />
                    </StyledConfigWrapper>
                </Dialog>
            )}
        </>
    );
};

export default compose(
    withTextContext(),
    withMessageHandler()
)(ConfigItemManager);
