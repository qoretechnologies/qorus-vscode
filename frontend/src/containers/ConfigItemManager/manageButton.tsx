import { ReqoreButton } from '@qoretechnologies/reqore';
import size from 'lodash/size';
import { FunctionComponent, memo, useState } from 'react';
import { useMount } from 'react-use';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { Messages } from '../../constants/messages';
import withMessageHandler, { TMessageListener } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface IManageConfigButton {
  t: TTranslator;
  addMessageListener: TMessageListener;
  disabled: boolean;
  onClick: () => void;
  type?: string;
  fetchCall?: (ifaceId?: string) => void;
}

export const ManageConfigButton: FunctionComponent<IManageConfigButton> = memo(
  ({ t, addMessageListener, disabled, onClick, type, fetchCall }) => {
    const [configCount, setConfigCount] = useState<number>(0);

    useMount(() => {
      // Listen for changes in config items for
      // this interface
      const messageHandler = addMessageListener(Messages.RETURN_CONFIG_ITEMS, (data) => {
        const itemCount =
          type === 'workflow'
            ? size(data.workflow_items?.filter((item) => item.is_set))
            : size(data.items);
        // Set the new config count
        setConfigCount(itemCount);
      });

      fetchCall?.();
      // Unregister the message handler
      return () => {
        messageHandler();
      };
    });

    return (
      <ReqoreButton
        disabled={disabled}
        badge={configCount}
        icon={'SettingsLine'}
        onClick={onClick}
        tooltip={t('ManageConfigItems')}
      >
        {t('ManageConfigItems')}
      </ReqoreButton>
    );
  }
);

export default compose(withTextContext(), withMessageHandler())(ManageConfigButton);
