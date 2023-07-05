import {
  ReqoreCheckbox,
  ReqoreColumn,
  ReqoreColumns,
  ReqoreControlGroup,
  ReqoreModal,
  ReqorePanel,
  ReqoreTag,
  ReqoreTagGroup,
} from '@qoretechnologies/reqore';
import { reduce, size } from 'lodash';
import { useState } from 'react';
import { SaveColorEffect, WarningColorEffect } from '../../components/Field/multiPair';
import { IQorusType } from '../../components/Field/systemOptions';
import { getFilteredItems, getUniqueValuesFromConfigItemsByKey } from '../../helpers/common';

export type TConfigItem = {
  name: string;
  default_value?: any;
  description: string;
  config_group: string | number;
  parent_data?: {
    name: string;
    default_value?: any;
    description: string;
    config_group: string | number;
  };
  parent?: {
    'interface-type': string;
    'interface-name': string;
    'interface-version': string;
  };
  parent_class?: string;
  type: IQorusType;
  value?: any;
  level?: 'default' | 'step' | 'workflow' | 'global';
  // Every 5th item is not set
  is_set: boolean;
  yamlData?: {
    value: any;
    default_value: any;
  };
};

export interface IConfigItemsManagerFiltersProps {
  localItems: TConfigItem[];
  globalItems: TConfigItem[];
  workflowItems: TConfigItem[];
  filters: Record<keyof TConfigItem, string[]> | {};
  onSubmit: (filters: Record<string, string[]>) => void;
  onClose: () => void;
}

export const ConfigItemsManagerFilters = ({
  localItems = [],
  globalItems = [],
  workflowItems = [],
  onSubmit,
  filters = {},
  onClose,
}: IConfigItemsManagerFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(filters);
  const items = [...localItems, ...globalItems, ...workflowItems];

  const addFilter = (category, value) => {
    const newFilters = { ...localFilters };
    if (newFilters[category]) {
      newFilters[category].push(value);
    } else {
      newFilters[category] = [value];
    }

    setLocalFilters(newFilters);
  };

  const removeFilter = (category, value) => {
    const newFilters = { ...localFilters };

    if (newFilters[category]) {
      newFilters[category] = newFilters[category].filter((val) => val !== value);
    }

    if (!newFilters[category].length) {
      delete newFilters[category];
    }

    setLocalFilters(newFilters);
  };

  const isSelected = (category, value) => {
    return localFilters[category]?.includes(value);
  };

  const filteredItems = getFilteredItems(items, localFilters);
  const filterCount = reduce(localFilters, (count, filters) => count + size(filters), 0);

  return (
    <ReqoreModal
      isOpen
      onClose={onClose}
      label="Filters"
      className="filters"
      actions={[
        {
          label: `Reset all filters`,
          badge: filterCount,
          icon: 'HistoryLine',
          className: 'filters-reset',
          onClick: () => setLocalFilters({}),
          show: !!size(localFilters),
        },
      ]}
      bottomActions={[
        {
          label: 'View items',
          onClick: () => {
            onSubmit(localFilters);
            onClose();
          },
          effect: SaveColorEffect,
          icon: 'CheckLine',
          badge: size(filteredItems),
          disabled: !size(filteredItems),
          position: 'right',
          show: !!size(filteredItems),
        },
        {
          label: 'No items match your filters',
          effect: WarningColorEffect,
          readOnly: true,
          icon: 'InformationLine',
          position: 'right',
          show: !size(filteredItems),
        },
      ]}
    >
      <ReqoreColumns>
        <ReqoreColumn>
          <ReqorePanel flat minimal label="Type">
            <ReqoreTagGroup size="small">
              {getUniqueValuesFromConfigItemsByKey(items, 'type').map((type: string) => (
                <ReqoreTag
                  key={type}
                  label={type}
                  onClick={() =>
                    isSelected('type', type) ? removeFilter('type', type) : addFilter('type', type)
                  }
                  intent={isSelected('type', type) ? 'info' : undefined}
                />
              ))}
            </ReqoreTagGroup>
          </ReqorePanel>
        </ReqoreColumn>
        <ReqoreColumn>
          <ReqorePanel flat minimal label="Level">
            <ReqoreTagGroup size="small">
              {getUniqueValuesFromConfigItemsByKey(items, 'level').map((type: string) => (
                <ReqoreTag
                  key={type}
                  label={type}
                  onClick={() =>
                    isSelected('level', type)
                      ? removeFilter('level', type)
                      : addFilter('level', type)
                  }
                  intent={isSelected('level', type) ? 'info' : undefined}
                />
              ))}
            </ReqoreTagGroup>
          </ReqorePanel>
        </ReqoreColumn>
        <ReqoreColumn>
          <ReqorePanel flat minimal label="Parent">
            <ReqoreTagGroup size="small">
              {getUniqueValuesFromConfigItemsByKey(items, 'parent_class').map((type: string) => (
                <ReqoreTag
                  key={type}
                  label={type}
                  onClick={() =>
                    isSelected('parent_class', type)
                      ? removeFilter('parent_class', type)
                      : addFilter('parent_class', type)
                  }
                  intent={isSelected('parent_class', type) ? 'info' : undefined}
                />
              ))}
            </ReqoreTagGroup>
          </ReqorePanel>
        </ReqoreColumn>
        <ReqoreColumn>
          <ReqorePanel flat minimal label="Show items">
            <ReqoreControlGroup vertical size="small">
              <ReqoreCheckbox
                checked={isSelected('is_set', true)}
                label="With value"
                asSwitch
                intent={isSelected('is_set', true) ? 'info' : undefined}
                margin="none"
                onClick={() => {
                  if (isSelected('is_set', true)) {
                    removeFilter('is_set', true);
                  } else {
                    addFilter('is_set', true);
                  }
                }}
              />
              <ReqoreCheckbox
                checked={isSelected('is_set', false)}
                label="Without value"
                asSwitch
                intent={isSelected('is_set', false) ? 'info' : undefined}
                margin="none"
                onClick={() => {
                  if (isSelected('is_set', false)) {
                    removeFilter('is_set', false);
                  } else {
                    addFilter('is_set', false);
                  }
                }}
              />
            </ReqoreControlGroup>
          </ReqorePanel>
        </ReqoreColumn>
        <ReqoreColumn>
          <ReqorePanel flat minimal label="Strictly local">
            <ReqoreControlGroup vertical size="small">
              <ReqoreCheckbox
                checked={isSelected('strictly_local', true)}
                label="Yes"
                asSwitch
                intent={isSelected('strictly_local', true) ? 'info' : undefined}
                margin="none"
                onClick={() => {
                  if (isSelected('strictly_local', true)) {
                    removeFilter('strictly_local', true);
                  } else {
                    addFilter('strictly_local', true);
                  }
                }}
              />
              <ReqoreCheckbox
                checked={isSelected('strictly_local', false)}
                label="No"
                asSwitch
                intent={isSelected('strictly_local', false) ? 'info' : undefined}
                margin="none"
                onClick={() => {
                  if (isSelected('strictly_local', false)) {
                    removeFilter('strictly_local', false);
                  } else {
                    addFilter('strictly_local', false);
                  }
                }}
              />
            </ReqoreControlGroup>
          </ReqorePanel>
        </ReqoreColumn>
      </ReqoreColumns>
    </ReqoreModal>
  );
};
