import { Button, ControlGroup } from '@blueprintjs/core';
import { ReqoreButton, ReqoreControlGroup, ReqoreMultiSelect } from '@qoretechnologies/reqore';
import { TReqoreMultiSelectItem } from '@qoretechnologies/reqore/dist/components/MultiSelect';
import { size } from 'lodash';
import { FunctionComponent, useMemo, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { StyledDialogBody } from '../../containers/ClassConnectionsManager';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import FieldEnhancer from '../FieldEnhancer';
import String from './string';

export interface IMultiSelectField {
  get_message: { action: string; object_type: string };
  return_message: { action: string; object_type: string; return_value: string };
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
  addMessageListener,
  postMessage,
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
      postMessage(get_message.action, { object_type: get_message.object_type });
      addMessageListener(return_message.action, (data: any) => {
        // Check if this is the correct
        // object type
        if (data.object_type === return_message.object_type) {
          setItems(data[return_message.return_value]);
        }
      });
    }
  });

  const setSelectedItems = (newValue: string[]) => {
    // Send the selected items whenever they change
    onChange(name, newValue);
  };

  const handleSelectClick: (item: any) => void = (item) => {
    // Check if this item is selected
    const isSelected: boolean = !!value.find(
      (selectedItem: any) => selectedItem.name === item.name
    );
    // Remove the item if it's selected
    if (isSelected) {
      deselectItem(item.name);
    } else {
      // Check if this item was created by the user
      const existsInItems: boolean = !!items.find(
        (selectedItem: any) => selectedItem.name === item.name
      );
      // Add the item if it does not exist
      if (!existsInItems) {
        setItems((currentItems) => [...currentItems, item]);
      }
      // Set the selected item
      setSelectedItems([...value, item]);
    }
  };

  const handleTagRemoveClick: (tag: string) => void = (tag) => {
    deselectItem(tag);
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
    postMessage(get_message.action, { object_type: get_message.object_type });
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
      postMessage(get_message.action, { object_type: get_message.object_type });
    }
    setEditorManager({});
    setSelectedItems(newItems);
  };

  const handleClearClick: () => void = () => {
    setSelectedItems([]);
  };

  const deselectItem: (tagName: string | any) => void = (tagName) => {
    tagName = typeof tagName === 'string' ? tagName : tagName.props.children;
    // If this is the mapper code field
    // remove the selected mapper code from relations
    if (name === 'codes') {
      removeCodeFromRelations([tagName]);
    }
    // Remove tag
    setSelectedItems(value.filter((item: any) => item.name !== tagName));
  };

  // Clear button
  const ClearButton = size(value) ? (
    <Button icon={'cross'} minimal onClick={handleClearClick} />
  ) : undefined;

  canEdit = !!reference || canEdit;

  const val = useMemo(
    () => value.map((item: any) => (typeof item === 'object' ? item.name : item)),
    [value]
  );

  return (
    <FieldEnhancer context={context}>
      {(onEditClick, onCreateClick) => (
        <>
          {editorManager.isOpen && (
            <CustomDialog title={t('EditItem')} onClose={() => setEditorManager({})} isOpen>
              <StyledDialogBody style={{ flexFlow: 'column' }}>
                <String
                  fill
                  name="edit"
                  value={editorManager.value}
                  onChange={(_name, v) => setEditorManager({ ...editorManager, value: v })}
                />
                <br />
                <ControlGroup fill>
                  <Button
                    text={t('Save')}
                    onClick={() => handleSaveTagEdit()}
                    disabled={editorManager.value === ''}
                    intent="success"
                  />
                </ControlGroup>
              </StyledDialogBody>
            </CustomDialog>
          )}
          <ReqoreControlGroup fluid verticalAlign="flex-start">
            <ReqoreMultiSelect
              items={items.map(
                (item): TReqoreMultiSelectItem => ({
                  value: item.name,
                  icon: canEdit && onEditClick ? 'EditLine' : undefined,
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
                intent="success"
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
  withMapperConsumer(),
  onlyUpdateForKeys(['value', 'activeId'])
)(MultiSelectField);
