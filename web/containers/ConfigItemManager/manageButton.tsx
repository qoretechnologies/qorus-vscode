import React, { FunctionComponent, useState } from 'react';
import withMessageHandler, { TMessageListener } from '../../hocomponents/withMessageHandler';
import { TTranslator } from '../../App';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { Messages } from '../../constants/messages';
import size from 'lodash/size';
import { ButtonGroup, Tooltip, Button } from '@blueprintjs/core';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';

export interface IManageConfigButton {
    t: TTranslator;
    addMessageListener: TMessageListener;
    disabled: boolean;
    onClick: () => void;
    type?: string;
}

const ManageConfigButton: FunctionComponent<IManageConfigButton> = ({
    t,
    addMessageListener,
    disabled,
    onClick,
    type,
}) => {
    const [configCount, setConfigCount] = useState<number>(0);

    useEffectOnce(() => {
        // Listen for changes in config items for
        // this interface
        const messageHandler = addMessageListener(Messages.RETURN_CONFIG_ITEMS, data => {
            const itemCount =
                type === 'workflow' ? size(data.workflow_items?.filter(item => item.is_set)) : size(data.items);
            // Set the new config count
            setConfigCount(itemCount);
        });
        // Unregister the message handler
        return () => {
            messageHandler();
        };
    });

    return (
        <Tooltip content={t('ManageConfigItems')} disabled={disabled}>
            <Button
                name={'interface-creator-manage-config-items'}
                disabled={disabled}
                text={`${t('ManageConfigItems')}(${configCount})`}
                icon={'cog'}
                onClick={onClick}
            />
        </Tooltip>
    );
};

export default compose(withTextContext(), withMessageHandler())(ManageConfigButton);
