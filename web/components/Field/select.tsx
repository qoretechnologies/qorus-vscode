import {
  Button,
  ButtonGroup,
  Classes,
  ControlGroup,
  Icon,
  IconName,
  Menu,
  MenuItem,
  Tooltip,
} from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { capitalize, get, noop, size } from 'lodash';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useMount from 'react-use/lib/useMount';
import { compose } from 'recompose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import FieldEnhancer from '../FieldEnhancer';
import Spacer from '../Spacer';
import SubField, { DescriptionField } from '../SubField';
import StringField from './string';
import { StyledOptionField } from './systemOptions';

export interface ISelectField {
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  t: TTranslator;
  defaultItems?: any[];
  predicate: (name: string) => boolean;
  placeholder: string;
  fill?: boolean;
  disabled?: boolean;
  position?: any;
  requestFieldData: (name: string, key?: string) => any;
  messageData: any;
  warningMessageOnEmpty?: string;
  autoSelect?: boolean;
  asMenu?: boolean;
  icon?: IconName;
  filters?: string[];
}

export const StyledDialogSelectItem = styled.div`
  &:not(:last-child) {
    margin-bottom: 10px;
  }

  max-height: 150px;
  overflow: hidden;
  position: relative;

  &:before {
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    // Linear gradient from top transparent to bottom white
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 1) 100%
    );
    z-index: 10;
  }

  background-color: #fff;

  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  transition: all 0.2s;

  &:hover,
  &.selected {
    cursor: pointer;
    transform: scale(0.98);
    box-shadow: 0 0 10px -6px #555;
  }

  &.selected {
    border: 2px solid #7fba27;
  }

  h5 {
    margin: 0;
    padding: 0;
    font-size: 14px;
  }

  p {
    margin: 0;
    padding: 0;
    font-size: 12px;
  }
`;

const SelectField: React.FC<ISelectField & IField & IFieldChange> = ({
  get_message,
  return_message,
  addMessageListener,
  postMessage,
  name,
  onChange,
  value,
  defaultItems,
  t,
  predicate,
  placeholder,
  fill,
  disabled,
  requestFieldData,
  warningMessageOnEmpty,
  autoSelect,
  reference,
  iface_kind,
  context,
  editOnly,
  target_dir,
  forceDropdown,
  asMenu,
  icon,
  filters,
}) => {
  const [items, setItems] = useState<any[]>(defaultItems || []);
  const [query, setQuery] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [isSelectDialogOpen, setSelectDialogOpen] = useState<boolean>(false);
  const [listener, setListener] = useState(null);
  const [hasProcessor, setHasProcessor] = useState<boolean>(
    requestFieldData ? requestFieldData('processor', 'selected') : false
  );
  const [isProcessorSelected, setIsProcessorSelected] = useState<boolean>(
    requestFieldData ? requestFieldData('processor', 'selected') : false
  );

  useMount(() => {
    handleClick();
  });

  useEffect(() => {
    if (hasProcessor && name === 'base-class-name') {
      listener && listener();
      setListener(() =>
        addMessageListener(return_message.action, (data: any) => {
          const newItems = get(data, 'objects');

          if (data.object_type === 'processor-base-class') {
            setItems(get(data, 'objects'));

            // Check if the current value is a correct processor class
            // Remove the value if not
            if (value && !newItems.find((item) => item.name === value)) {
              onChange(name, null);
            } else {
              onChange(name, value);
            }
          }
        })
      );
    } else {
      listener && listener();
      if (return_message) {
        setListener(() =>
          addMessageListener(return_message.action, (data: any) => {
            // Check if this is the correct
            // object type
            if (!return_message.object_type || data.object_type === return_message.object_type) {
              setItems(get(data, return_message.return_value));
            }
          })
        );
      }
    }
  }, [hasProcessor, return_message?.object_type]);

  useEffect(() => {
    setIsProcessorSelected(requestFieldData ? requestFieldData('processor', 'selected') : false);
  });

  // Check if the processor field exists on every change
  useEffect(() => {
    if (isProcessorSelected) {
      if (!hasProcessor) {
        setHasProcessor(true);
      }
    } else {
      if (hasProcessor) {
        setHasProcessor(false);
      }
    }
  }, [isProcessorSelected]);

  useEffect(() => {
    if (defaultItems) {
      setItems(defaultItems);
    }
  }, [defaultItems]);

  useEffect(() => {
    handleClick();
  }, [listener]);

  const handleEditSubmit: (_defaultName: string, val: string) => void = (_defaultName, val) => {
    handleSelectClick({ name: val });
    handleClick();
  };

  const handleSelectClick: (item: any) => void = (item) => {
    if (item === value) {
      return;
    }
    // Set the selected item
    onChange(name, item.name);
  };

  const handleClick: () => void = () => {
    let className: string;

    if (requestFieldData) {
      const classClassName = requestFieldData('class-class-name', 'value');
      const cName = requestFieldData('class-name', 'value');

      className = classClassName || cName;
    }

    if (hasProcessor && name === 'base-class-name') {
      // Get only the processor related classes
      postMessage('creator-get-objects', {
        object_type: 'processor-base-class',
        lang: requestFieldData('lang', 'value') || 'qore',
        iface_kind,
        class_name: className,
      });
    } else if (get_message) {
      get_message.message_data = get_message.message_data || {};
      // Get the list of items from backend
      postMessage(get_message.action, {
        object_type: get_message.object_type,
        data: { ...get_message.message_data },
        lang: requestFieldData ? requestFieldData('lang', 'value') : 'qore',
        iface_kind,
        class_name: className,
      });
    }
  };

  let filteredItems: any[] = items;

  // If we should run the items thru predicate
  if (predicate) {
    filteredItems = filteredItems.filter((item) => predicate(item.name));
  }

  if (autoSelect && filteredItems.length === 1) {
    // Automaticaly select the first item
    if (filteredItems[0].name !== value) {
      handleSelectClick(filteredItems[0]);
    }
    // Show readonly string
    return (
      <StringField
        value={value || filteredItems[0].name}
        read_only
        name={name}
        onChange={() => noop()}
      />
    );
  }

  /**
   * It returns true if any of the items in the data array have a desc property
   * @param data - The data that we're going to be checking.
   * @returns A boolean value.
   */
  const hasItemsWithDesc = (data) => {
    return data.some((item) => item.desc);
  };

  if (!reference && (!filteredItems || filteredItems.length === 0)) {
    return (
      <Button
        fill={fill}
        text={t('NoDataAvailable')}
        rightIcon={'caret-down'}
        icon="disable"
        disabled
      />
    );
  }

  const filterItems = (items) => {
    return items.filter((item: any) => {
      let isMatch = true;

      if (query) {
        isMatch = item.name.toLowerCase().includes(query.toLowerCase());
      }

      if (appliedFilters.length > 0) {
        isMatch = appliedFilters.some((filter) => item[filter]);
      }

      return isMatch;
    });
  };

  const getItemDescription = (itemName) => {
    return items.find((item) => item.name === itemName)?.desc;
  };

  return (
    <FieldEnhancer
      context={{
        iface_kind,
        target_dir: (requestFieldData && requestFieldData('target_dir', 'value')) || target_dir,
        ...context,
      }}
    >
      {(onEditClick, onCreateClick) => (
        <>
          <ControlGroup fill={fill} style={{ flex: 'none' }}>
            {reference && (
              <>
                {!editOnly && (
                  <Button
                    icon="add"
                    className={Classes.FIXED}
                    intent="success"
                    name={`field-${name}-reference-add-new`}
                    onClick={() => onCreateClick(reference, handleEditSubmit)}
                  />
                )}
                {value && (
                  <Button
                    icon="edit"
                    className={Classes.FIXED}
                    name={`field-${name}-edit-reference`}
                    onClick={() => onEditClick(value, reference, handleEditSubmit)}
                  />
                )}
              </>
            )}
            {!filteredItems || filteredItems.length === 0 ? (
              <StringField
                value={t('NothingToSelect')}
                read_only
                disabled
                name={name}
                onChange={() => {}}
              />
            ) : (
              <>
                {hasItemsWithDesc(items) && !forceDropdown ? (
                  <>
                    <Button
                      name={`field-${name}`}
                      fill={fill}
                      text={value ? value : placeholder || t('PleaseSelect')}
                      rightIcon="widget-header"
                      intent={value ? 'primary' : undefined}
                      onClick={() => setSelectDialogOpen(true)}
                      disabled={disabled}
                      style={{ whiteSpace: 'nowrap' }}
                    />
                    {isSelectDialogOpen && (
                      <CustomDialog
                        isOpen
                        icon="list"
                        onClose={() => {
                          setSelectDialogOpen(false);
                          setQuery('');
                        }}
                        title={t('SelectItem')}
                        style={{
                          maxHeight: '80vh',
                          width: '50vw',
                          minWidth: '500px',
                          overflow: 'auto',
                          padding: 0,
                        }}
                      >
                        <div
                          className={Classes.DIALOG_BODY}
                          style={{ display: 'flex', flexFlow: 'column', overflow: 'hidden' }}
                        >
                          <StyledOptionField>
                            <SubField title="Filters">
                              <StringField
                                onChange={(_name, value) => setQuery(value)}
                                value={query}
                                name="select-filter"
                                placeholder={t('Filter')}
                                autoFocus
                              />
                              <Spacer size={10} />
                              <ButtonGroup>
                                {filters?.map((filter) => (
                                  <Button
                                    key={filter}
                                    intent={appliedFilters.includes(filter) ? 'primary' : 'none'}
                                    onClick={() => {
                                      // Add this filter to the applied filters if it's not already there
                                      if (!appliedFilters.includes(filter)) {
                                        setAppliedFilters([...appliedFilters, filter]);
                                      } else {
                                        // Remove this filter from the applied filters
                                        setAppliedFilters(
                                          appliedFilters.filter((f) => f !== filter)
                                        );
                                      }
                                    }}
                                  >
                                    {capitalize(filter.replace('_', ' '))} (
                                    {items.filter((item) => item[filter]).length})
                                  </Button>
                                ))}
                              </ButtonGroup>
                            </SubField>
                          </StyledOptionField>
                          <StyledOptionField style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                            <SubField
                              title="Items"
                              detail={size(filterItems(filteredItems)).toString()}
                              isValid={!!size(filterItems(filteredItems))}
                            >
                              <div>
                                {filterItems(filteredItems).map((item) => (
                                  <Tooltip
                                    key={item.name}
                                    position="top"
                                    boundary="viewport"
                                    targetProps={{
                                      style: {
                                        width: '100%',
                                      },
                                    }}
                                    hoverOpenDelay={500}
                                    interactionKind="hover"
                                    content={<ReactMarkdown source={item.desc} />}
                                  >
                                    <StyledDialogSelectItem
                                      className={item.name === value ? 'selected' : ''}
                                      name={`field-${name}-item`}
                                      onClick={() => {
                                        handleSelectClick(item);
                                        setSelectDialogOpen(false);
                                        setQuery('');
                                      }}
                                    >
                                      <h5>
                                        {item.name === value && (
                                          <Icon icon="small-tick" style={{ color: '#7fba27' }} />
                                        )}{' '}
                                        {item.name}
                                      </h5>

                                      <p className={Classes.TEXT_MUTED}>
                                        <ReactMarkdown source={item.desc || t('NoDescription')} />
                                      </p>
                                    </StyledDialogSelectItem>
                                  </Tooltip>
                                ))}
                              </div>
                            </SubField>
                          </StyledOptionField>
                        </div>
                      </CustomDialog>
                    )}
                  </>
                ) : asMenu ? (
                  <Menu>
                    {filteredItems.map((item) => (
                      <MenuItem
                        key={item.name}
                        text={item.name}
                        onClick={() => {
                          handleSelectClick(item);
                          setSelectDialogOpen(false);
                          setQuery('');
                        }}
                      />
                    ))}
                  </Menu>
                ) : (
                  <Select
                    items={query === '' ? filteredItems : filterItems(filteredItems)}
                    itemRenderer={(item, data) => (
                      <MenuItem
                        name={`field-${name}-item`}
                        title={item.desc}
                        icon={value && item.name === value ? 'tick' : 'blank'}
                        text={item.name}
                        onClick={data.handleClick}
                      />
                    )}
                    inputProps={{
                      placeholder: t('Filter'),
                      name: 'field-select-filter',
                      autoFocus: true,
                    }}
                    popoverProps={{
                      popoverClassName: 'custom-popover',
                      targetClassName: fill ? 'select-popover' : '',
                      position: 'left',
                    }}
                    className={fill ? Classes.FILL : ''}
                    onItemSelect={(item: any) => handleSelectClick(item)}
                    query={query}
                    onQueryChange={(newQuery: string) => setQuery(newQuery)}
                    disabled={disabled}
                  >
                    <Button
                      name={`field-${name}`}
                      fill={fill}
                      intent={value ? 'primary' : undefined}
                      text={value ? value : placeholder || t('PleaseSelect')}
                      rightIcon={'caret-down'}
                      onClick={handleClick}
                      icon={icon}
                      style={{ whiteSpace: 'nowrap' }}
                    />
                  </Select>
                )}
              </>
            )}
          </ControlGroup>
          <div>
            <DescriptionField desc={getItemDescription(value)} />
          </div>
        </>
      )}
    </FieldEnhancer>
  );
};

export default compose(withTextContext(), withMessageHandler())(SelectField);
