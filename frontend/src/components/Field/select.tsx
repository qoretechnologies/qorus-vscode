import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreControlGroup,
  ReqoreDropdown,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreMessage,
  ReqoreTag,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { IReqoreMenuItemProps } from '@qoretechnologies/reqore/dist/components/Menu/item';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { TReqoreIntent } from '@qoretechnologies/reqore/dist/constants/theme';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { capitalize, get, size } from 'lodash';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useMount from 'react-use/lib/useMount';
import { compose } from 'recompose';
import styled from 'styled-components';
import { IField } from '../../components/FieldWrapper';
import withMessageHandler, {
  addMessageListener,
  postMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import FieldEnhancer from '../FieldEnhancer';
import { PositiveColorEffect } from './multiPair';

export interface ISelectField extends IField {
  defaultItems?: {
    name: string;
    desc?: string;
    intent?: TReqoreIntent;
    badge?: IReqorePanelProps['badge'];
  }[];
  predicate?: (name: string) => boolean;
  placeholder?: string;
  disabled?: boolean;
  position?: any;
  requestFieldData?: (name: string, key?: string) => any;
  warningMessageOnEmpty?: string;
  autoSelect?: boolean;
  asMenu?: boolean;
  icon?: IReqoreIconName;
  filters?: string[];
  description?: string;
  editOnly?: boolean;
  target_dir?: string;
  forceDropdown?: boolean;
  context?: any;
  className?: string;
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

const SelectField: React.FC<ISelectField & IField> = ({
  get_message,
  return_message,
  name,
  description,
  onChange,
  value,
  defaultItems,
  t,
  predicate,
  placeholder,
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
  className,
  ...rest
}) => {
  const [items, setItems] = useState<{ name: string; desc?: string }[]>(defaultItems || []);
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

  const reqoreItems: IReqoreMenuItemProps[] = filteredItems.map((item) => ({
    label: item.name,
    description: item.desc,
    value: item.name,
    selected: item.name === value,
    onClick: () => handleSelectClick(item),
  }));

  if (autoSelect && filteredItems.length === 1) {
    // Automaticaly select the first item
    if (filteredItems[0].name !== value) {
      handleSelectClick(filteredItems[0]);
    }
    // Show readonly string
    return (
      <ReqoreButton
        label={value || filteredItems[0].name}
        description={filteredItems[0].desc}
        readOnly
        icon={filteredItems[0].desc ? icon : 'ArrowDownSFill'}
        rightIcon={filteredItems[0].desc ? 'ListUnordered' : undefined}
        effect={{
          gradient: {
            direction: 'to left',
            colors: value ? 'info' : 'main',
          },
        }}
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
    return <ReqoreMessage intent="muted">{t('NoDataAvailable')}</ReqoreMessage>;
  }

  const filterItems = (items) => {
    return items.filter((item: any) => {
      let isMatch = true;

      if (query) {
        isMatch = item.label.toLowerCase().includes(query.toLowerCase());
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
    <>
      <CustomDialog
        isOpen={isSelectDialogOpen}
        icon="ListOrdered"
        onClose={() => {
          setSelectDialogOpen(false);
          setQuery('');
        }}
        title={`Select from items`}
        badge={size(items)}
      >
        <ReqoreCollection
          maxItemHeight={200}
          filterable
          size="big"
          sortable
          padded={false}
          showSelectedFirst
          selectedIcon="CheckLine"
          fill
          className="q-select-dialog"
          inputProps={{
            rightIcon: 'KeyboardFill',
            focusRules: {
              type: 'keypress',
              shortcut: 'letters',
              clearOnFocus: true,
            },
          }}
          items={filterItems(filteredItems).map(
            (item): IReqoreCollectionItemProps => ({
              label: item.name,
              content: <ReactMarkdown>{item.desc}</ReactMarkdown>,
              flat: false,
              size: 'small',
              minimal: false,
              selected: item.name === value,
              intent: item.intent,
              badge: item.badge,
              tooltip: !!item.desc
                ? {
                    delay: 800,
                    content: <ReactMarkdown>{item.desc}</ReactMarkdown>,
                    maxWidth: '70vw',
                  }
                : undefined,
              headerEffect: { color: '#ffffff' },
              contentEffect:
                item.name === value
                  ? { gradient: { colors: 'main' } }
                  : { color: 'muted:lighten:2' },
              onClick: () => {
                handleSelectClick(item);
                setSelectDialogOpen(false);
              },
            })
          )}
          actions={filters?.map((filter) => ({
            label: capitalize(filter.replace('_', ' ')),
            badge: items.filter((item) => item[filter]).length,
            active: appliedFilters.includes(filter),
            effect: appliedFilters.includes(filter) ? PositiveColorEffect : undefined,
            onClick: () => {
              // Add this filter to the applied filters if it's not already there
              if (!appliedFilters.includes(filter)) {
                setAppliedFilters([...appliedFilters, filter]);
              } else {
                // Remove this filter from the applied filters
                setAppliedFilters(
                  appliedFilters.filter((appliedFilter) => appliedFilter !== filter)
                );
              }
            },
          }))}
        />
      </CustomDialog>
      {!filteredItems || filteredItems.length === 0 ? (
        <ReqoreTag color="transparent" icon="ForbidLine" label={t('NothingToSelect')} />
      ) : null}
      <FieldEnhancer
        // What should happen when the user deletes an interface
        // from the Interface dialog?
        onDelete={reference?.onDelete}
        context={{
          iface_kind,
          target_dir: (requestFieldData && requestFieldData('target_dir', 'value')) || target_dir,
          ...context,
        }}
      >
        {(onEditClick, onCreateClick, otherRest) => (
          <ReqoreControlGroup {...rest} {...otherRest} stack fill>
            {hasItemsWithDesc(items) && !forceDropdown ? (
              <ReqoreButton
                fluid
                key={value}
                wrap
                icon={icon}
                rightIcon="ListUnordered"
                onClick={() => setSelectDialogOpen(true)}
                description={
                  !!getItemDescription(value)
                    ? 'Hover to see description'
                    : 'Select from available items'
                }
                tooltip={
                  !!getItemDescription(value)
                    ? {
                        delay: 300,
                        content: <ReactMarkdown>{getItemDescription(value)}</ReactMarkdown>,
                        maxWidth: '50vh',
                      }
                    : undefined
                }
                disabled={disabled}
                effect={{
                  gradient: {
                    direction: 'to left',
                    colors: value ? 'info' : 'main',
                  },
                }}
                className={className}
              >
                {value ? value : placeholder || t('PleaseSelect')}
              </ReqoreButton>
            ) : asMenu ? (
              <ReqoreMenu>
                {filteredItems.map((item) => (
                  <ReqoreMenuItem
                    key={item.name}
                    label={item.name}
                    className={className}
                    onClick={() => {
                      handleSelectClick(item);
                      setSelectDialogOpen(false);
                      setQuery('');
                    }}
                  />
                ))}
              </ReqoreMenu>
            ) : (
              <ReqoreDropdown
                items={query === '' ? reqoreItems : filterItems(reqoreItems)}
                filterable
                key={value}
                disabled={disabled}
                wrap
                className={className}
                paging={{
                  itemsPerPage: 20,
                  infinite: true,
                  includeBottomControls: false,
                }}
                wrapperProps={{
                  className: 'q-select-popup',
                }}
                inputProps={{
                  className: 'q-select-input',
                }}
                description={getItemDescription(value) || description}
                effect={{
                  gradient: {
                    direction: 'to left',
                    colors: value ? 'info' : 'main',
                  },
                }}
              >
                {value ? value : placeholder || t('PleaseSelect')}
              </ReqoreDropdown>
            )}

            {reference ? (
              <ReqoreControlGroup fluid={false} stack>
                {!editOnly && (
                  <ReqoreButton
                    icon="AddLine"
                    fixed
                    className="select-reference-add-new"
                    effect={PositiveColorEffect}
                    onClick={() => onCreateClick(reference, handleEditSubmit)}
                  />
                )}
                {value && (
                  <ReqoreButton
                    icon="EditLine"
                    fixed
                    className="select-reference-edit"
                    onClick={() => onEditClick(value, reference, handleEditSubmit)}
                  />
                )}
              </ReqoreControlGroup>
            ) : null}
          </ReqoreControlGroup>
        )}
      </FieldEnhancer>
    </>
  );
};

export default compose(withTextContext(), withMessageHandler())(SelectField) as React.FC<
  ISelectField & IField
>;
