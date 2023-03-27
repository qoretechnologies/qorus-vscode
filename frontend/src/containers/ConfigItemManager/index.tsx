import { ReqoreButton, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useMount } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import CustomDialog from '../../components/CustomDialog';
import { Messages } from '../../constants/messages';
import InterfaceCreatorPanel from '../../containers/InterfaceCreator/panel';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
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

export const ConfigItemManager: FunctionComponent<IConfigItemManager> = ({
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
  processorData,
  onUpdate,
}) => {
  const [showConfigItemPanel, setShowConfigItemPanel] = useState<boolean>(false);
  const [configItemData, setConfigItemData] = useState<any>(false);
  const [configItems, setConfigItems] = useState<any>({});
  const initialConfigItems = useRef(null);

  useMount(() => {
    // Ask for the config items
    postMessage(Messages.GET_CONFIG_ITEMS, {
      'base-class-name': baseClassName,
      classes,
      iface_id: interfaceId,
      iface_kind: type,
      steps,
      state_data: stateData,
      processor_data: processorData,
    });
  });

  useEffect(() => {
    const itemsListener = addMessageListener(Messages.RETURN_CONFIG_ITEMS, (data) => {
      if (!initialConfigItems.current) {
        initialConfigItems.current = data;
      }
      setConfigItems(data);
      // Check if the initial config items are the same as the current config items
      // If they are, then we don't need to update the config items
      if (JSON.stringify(initialConfigItems.current) !== JSON.stringify(data)) {
        initialConfigItems.current = data;
        onUpdate?.();
      }
    });
    // Listen for config items data request
    // and open the fields editing
    const itemListener = addMessageListener(Messages.RETURN_CONFIG_ITEM, ({ item }) => {
      // Transform the type of the CI
      if (item.type.startsWith('*')) {
        item.type = item.type.replace('*', '');
        item.can_be_undefined = true;
      }
      // Set the config data
      setConfigItemData(item);
    });

    // Remove both listeners on unmount
    return () => {
      if (!!itemsListener && !!itemListener) {
        itemsListener();
        itemListener();
      }
    };
  });

  useEffect(() => {
    if (configItemData) {
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
  ) => void = (name, value, parent, level, isTemplatedString, remove, currentType) => {
    // Send message that the config item has been updated
    postMessage(Messages.UPDATE_CONFIG_ITEM_VALUE, {
      name,
      value,
      value_true_type: currentType,
      file_name: configItems.file_name,
      remove,
      level,
      iface_id: interfaceId,
      parent_class: parent,
      iface_kind: type,
      is_templated_string: isTemplatedString,
      state_id: stateData?.id,
      processor_id: processorData?.pid,
    });
  };

  const handleEditStructureClick: (configItemName: string) => void = (configItemName) => {
    // Request the config item data
    postMessage(Messages.GET_CONFIG_ITEM, {
      iface_id: interfaceId,
      name: configItemName,
      iface_kind: type,
      state_id: stateData?.id,
      processor_id: processorData?.pid,
    });
  };

  const handleDeleteStructureClick: (configItemName: string) => void = (configItemName) => {
    // Request the config item data
    postMessage(Messages.DELETE_CONFIG_ITEM, {
      iface_id: interfaceId,
      name: configItemName,
      iface_kind: type,
      state_id: stateData?.id,
      processor_id: processorData?.pid,
    });
  };

  return (
    <>
      {type !== 'workflow' && !disableAdding ? (
        <ReqoreButton intent="success" icon="AddLine" onClick={() => setShowConfigItemPanel(true)}>
          {t('AddConfigItem')}
        </ReqoreButton>
      ) : null}
      <ReqoreVerticalSpacer height={10} />
      <div>
        {configItems.global_items && (
          <GlobalTable
            definitionsOnly={definitionsOnly}
            configItems={configItems.global_items}
            initialItems={initialConfigItems.current.global_items}
            onSubmit={handleSubmit}
          />
        )}
        {(type === 'step' || type === 'workflow') && configItems.workflow_items ? (
          <GlobalTable
            definitionsOnly={definitionsOnly}
            configItems={configItems.workflow_items}
            initialItems={initialConfigItems.current.workflow_items}
            workflow
            onSubmit={handleSubmit}
          />
        ) : null}
        {configItems.items && type !== 'workflow' ? (
          <ConfigItemsTable
            configItems={{
              data: configItems.items,
            }}
            initialItems={initialConfigItems.current.items}
            definitionsOnly={definitionsOnly}
            onEditStructureClick={handleEditStructureClick}
            onDeleteStructureClick={handleDeleteStructureClick}
            onSubmit={handleSubmit}
            disableAdding={disableAdding}
            type={type}
          />
        ) : null}
      </div>

      {showConfigItemPanel && (
        <CustomDialog
          isOpen
          label={t('ConfigItemEditor')}
          onClose={() => {
            setConfigItemData(null);
            setShowConfigItemPanel(false);
            resetFields && resetFields('config-item');
          }}
        >
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
        </CustomDialog>
      )}
    </>
  );
};

export default compose(withTextContext(), withMessageHandler())(ConfigItemManager);
