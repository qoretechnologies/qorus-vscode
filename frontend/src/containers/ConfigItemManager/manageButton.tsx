import { ReqoreButton } from '@qoretechnologies/reqore';
import size from 'lodash/size';
import { FunctionComponent, memo, useContext, useState } from 'react';
import { useMount } from 'react-use';
import { Messages } from '../../constants/messages';
import { TextContext } from '../../context/text';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';

export interface IManageConfigButton {
  disabled: boolean;
  onClick: () => void;
  type?: string;
  fetchCall?: (ifaceId?: string) => void;
  'base-class-name'?: string;
  classes?: string[];
  iface_id?: string;
  iface_kind?: string;
  steps?: any[];
  state_data?: {
    id: string;
    class_name?: string;
  };
  processor_data: any;
}

const ManageConfigButton: FunctionComponent<IManageConfigButton> = memo(
  ({ disabled, onClick, type, fetchCall, ...rest }) => {
    const [configCount, setConfigCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const t = useContext(TextContext);

    useMount(() => {
      // Listen for changes in config items for
      // this interface
      const messageHandler = addMessageListener(Messages.RETURN_CONFIG_ITEMS, (data) => {
        setIsLoading(false);
        const itemCount =
          type === 'workflow'
            ? size(data.workflow_items?.filter((item) => item.is_set))
            : size(data.items);
        // Set the new config count
        setConfigCount(itemCount);
      });

      if (fetchCall) {
        fetchCall();
      } else {
        // Fetch the config items for this interface
        // Ask for the config items
        postMessage(Messages.GET_CONFIG_ITEMS, {
          iface_kind: type,
          ...rest,
        });
      }
      // Unregister the message handler
      return () => {
        messageHandler();
      };
    });

    return (
      <ReqoreButton
        disabled={disabled}
        readOnly={isLoading}
        badge={isLoading ? undefined : configCount}
        icon={'SettingsLine'}
        onClick={onClick}
        tooltip={t('ManageConfigItems')}
      >
        {isLoading ? 'Loading...' : t('ManageConfigItems')}
      </ReqoreButton>
    );
  }
);

export default ManageConfigButton;
