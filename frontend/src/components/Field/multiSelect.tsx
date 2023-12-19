import { ReqoreButton, ReqoreControlGroup, ReqoreMultiSelect } from '@qoretechnologies/reqore';
import { TReqoreMultiSelectItem } from '@qoretechnologies/reqore/dist/components/MultiSelect';
import { FunctionComponent, useMemo, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { submitControl } from '../../containers/InterfaceCreator/controls';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
  addMessageListener,
  postMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import FieldEnhancer from '../FieldEnhancer';
import { PositiveColorEffect } from './multiPair';
import String from './string';

export interface IMultiSelectField {
  get_message: { action: string; object_type: string; useWebSocket?: boolean };
  return_message: {
    action: string;
    object_type: string;
    return_value: string;
    useWebSocket?: boolean;
  };
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  name: string;
  t: TTranslator;
  simple: boolean;
  activeId: number;
  default_items?: [];
  canEdit?: boolean;
}

const MultiSelectField: FunctionComponent<IMultiSelectField & IField & IFieldChange> = ({
  get_message,
  return_message,
  onChange,
  name,
  value = [],
  t,
  simple,
  activeId,
  default_items,
  removeCodeFromRelations,
  canEdit,
  reference,
  context,
}) => {
  const [items, setItems] = useState<any[]>(default_items || []);
  const [editorManager, setEditorManager] = useState<any>({});

  useMount(() => {
    if (!simple) {
      postMessage(
        get_message.action,
        { object_type: get_message.object_type },
        get_message.useWebSocket
      );
      addMessageListener(
        return_message.action,
        (data: any) => {
          // Check if this is the correct
          // object type
          if (data.object_type === return_message.object_type) {
            setItems(data[return_message.return_value]);
          }
        },
        get_message.useWebSocket
      );
    }
  });

  const setSelectedItems = (newValue: string[]) => {
    // Send the selected items whenever they change
    onChange(
      name,
      newValue.map((val) => ({ name: val }))
    );
  };

  const handleTagClick: (tag: string) => void = (tag) => {
    setEditorManager({
      isOpen: true,
      defaultValue: tag,
      value: tag,
    });
  };

  const handleSaveTagCreate: (_defaultValue: string, val: string) => void = (
    _defaultValue,
    val
  ) => {
    // Add new item to the list
    const newItems = [
      ...value,
      {
        name: val,
      },
    ];
    postMessage(
      get_message.action,
      { object_type: get_message.object_type },
      get_message.useWebSocket
    );
    setEditorManager({});
    setSelectedItems(newItems);
  };

  const handleSaveTagEdit: (defaultValue?: string, name?: string) => void = (
    defaultValue = editorManager.defaultValue,
    val = editorManager.value
  ) => {
    const newItems = value.reduce((modifiedValue: any[], item: any) => {
      const newItem = { ...item };
      // Check if the item matches the default value of the edite item
      if (item.name === defaultValue) {
        newItem.name = val;
      }

      return [...modifiedValue, newItem];
    }, []);
    if (!simple) {
      postMessage(
        get_message.action,
        { object_type: get_message.object_type },
        get_message.useWebSocket
      );
    }
    setEditorManager({});
    setSelectedItems(newItems);
  };

  canEdit = !!reference || canEdit;

  const val = useMemo(
    () => value.map((item: any) => (typeof item === 'object' ? item.name : item)),
    [value]
  );

  const _items = useMemo(
    () => [
      ...items,
      ...val
        .map((item: string) => {
          // Check if this item is in items already
          const itemExists = items.find((i) => i.name === item);
          // If it doesn't exist, add it to the items
          if (!itemExists) {
            return { name: item };
          }

          return null;
        })
        .filter((item) => item),
    ],
    [items, value]
  );

  return (
    <FieldEnhancer context={context}>
      {(onEditClick, onCreateClick) => (
        <>
          {editorManager.isOpen && (
            <CustomDialog
              title={t('EditItem')}
              onClose={() => setEditorManager({})}
              isOpen
              bottomActions={[
                submitControl(() => handleSaveTagEdit(), { disabled: editorManager.value === '' }),
              ]}
            >
              <String
                fill
                name="edit"
                value={editorManager.value}
                onChange={(_name, v) => setEditorManager({ ...editorManager, value: v })}
              />
            </CustomDialog>
          )}
          <ReqoreControlGroup fluid fill>
            <ReqoreMultiSelect
              items={_items.map(
                (item): TReqoreMultiSelectItem => ({
                  value: item.name,
                })
              )}
              enterKeySelects
              canCreateItems={!reference}
              canRemoveItems
              onItemClickIcon="EditLine"
              onValueChange={(newValue) => {
                setSelectedItems(newValue);
              }}
              value={val}
              onItemClick={
                canEdit
                  ? (item) => {
                      if (onEditClick && reference) {
                        onEditClick(item.value, reference, handleSaveTagEdit);
                      } else {
                        handleTagClick(item.value);
                      }
                    }
                  : undefined
              }
            />
            {reference && (
              <ReqoreButton
                fixed
                tooltip={t('CreateAndAddNewItem')}
                icon="AddLine"
                effect={PositiveColorEffect}
                onClick={() => onCreateClick(reference, handleSaveTagCreate)}
              />
            )}
          </ReqoreControlGroup>
        </>
      )}
    </FieldEnhancer>
  );
};

export default compose(
  withTextContext(),
  withMessageHandler(),
  withMapperConsumer()
)(MultiSelectField);
