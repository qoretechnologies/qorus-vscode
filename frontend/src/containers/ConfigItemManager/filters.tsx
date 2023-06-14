import {
  ReqoreColumn,
  ReqoreColumns,
  ReqoreModal,
  ReqorePanel,
  ReqoreTag,
  ReqoreTagGroup,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { useState } from 'react';
import { IQorusType } from '../../components/Field/systemOptions';
import { getUniqueValuesFromConfigItemsByKey } from '../../helpers/common';

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
  level?: 'default' | 'step';
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
  onSubmit: (filters: Record<string, string>) => void;
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

    setLocalFilters(newFilters);
  };

  const isSelected = (category, value) => {
    return localFilters[category]?.includes(value);
  };

  console.log(!size(localFilters));

  return (
    <ReqoreModal
      isOpen
      onClose={onClose}
      label="Filters"
      actions={[
        {
          label: `Reset all filters`,
          badge: size(localFilters),
          icon: 'HistoryLine',
          onClick: () => setLocalFilters({}),
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
      </ReqoreColumns>
    </ReqoreModal>
  );
};
