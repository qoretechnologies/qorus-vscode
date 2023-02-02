import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreInput,
  ReqorePanel,
} from '@qoretechnologies/reqore';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { map, size } from 'lodash';
import { useContext, useState } from 'react';
import { useAsyncRetry, useBoolean } from 'react-use';
import styled, { css } from 'styled-components';
import Loader from '../components/Loader';
import { interfaceNameToKind } from '../constants/interfaces';
import { MenuSubItems } from '../constants/menu';
import { TextContext } from '../context/text';
import { callBackendBasic } from '../helpers/functions';

const StyledCustomReleaseWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
  flex-flow: column;
`;

const StyledInterfaceItem = styled.div`
  margin-bottom: 20px;

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

export interface ICustomReleaseProps {
  selected: string[];
  onItemClick: (item: string[], isDeselect?: boolean) => void;
}

export const otherInterfaceIcons: Record<string, IReqoreIconName> = {
  'schema-modules': 'Database2Line',
  scripts: 'Shape2Line',
  tests: 'TestTubeLine',
};

export const otherInterfaceNames = {
  'schema-modules': 'Schema Modules',
  scripts: 'Scripts',
  tests: 'Tests',
};

export interface ICustomReleaseGroupProps {
  selected: string[];
  onItemClick: (item: string[], isDeselect?: boolean) => void;
  onSelectAll: (interfaceKind: string) => void;
  interfaces: any[];
  interfaceKind: string;
  getItemFile: (item: any) => string;
}

export const CustomReleaseGroup = ({
  selected,
  onItemClick,
  interfaces,
  interfaceKind,
  onSelectAll,
  getItemFile,
}: ICustomReleaseGroupProps) => {
  const [isCollapsed, setIsCollapsed] = useBoolean(false);
  const [query, setQuery] = useState<string>('');

  const t = useContext<(text: string) => string>(TextContext as any);

  const isSelected = (item: string): boolean => {
    return !!selected.find((selectedItem) => selectedItem === item);
  };

  const filteredInterfaces = interfaces.filter((item) => {
    return query && query !== '' ? item.name.toLowerCase().includes(query.toLowerCase()) : true;
  });

  const handleSelectFiltered = () => {
    onItemClick(filteredInterfaces.map((item) => getItemFile(item)) || []);
  };

  return (
    <StyledInterfaceItem key={interfaceKind} disabled={!size(interfaces)}>
      <ReqorePanel
        collapsible={size(interfaces) > 0}
        minimal
        isCollapsed
        label={`${
          MenuSubItems.find((interfaceMenuData) => {
            return interfaceNameToKind[interfaceMenuData.name] === interfaceKind;
          })?.name || otherInterfaceNames[interfaceKind]
        } (${filteredInterfaces.length})`}
        icon={
          MenuSubItems.find(
            (interfaceMenuData) => interfaceNameToKind[interfaceMenuData.name] === interfaceKind
          )?.icon || otherInterfaceIcons[interfaceKind]
        }
        actions={
          size(interfaces)
            ? [
                {
                  as: ReqoreInput,
                  props: {
                    value: query,
                    onChange: (e: any) => setQuery(e.target.value),
                    placeholder: t('Filter'),
                  },
                },
                {
                  label: query && query !== '' ? t('SelectFiltered') : t('SelectAll'),
                  icon: 'CheckboxMultipleLine',
                  intent: 'info',
                  onClick: () => {
                    if (query && query !== '') {
                      handleSelectFiltered();
                    } else {
                      onSelectAll(interfaceKind);
                    }
                  },
                },
              ]
            : undefined
        }
      >
        <ReqoreControlGroup vertical fluid>
          {map(filteredInterfaces, (interfaceData, index) => (
            <ReqoreButton
              key={index}
              icon={
                isSelected(getItemFile(interfaceData))
                  ? 'CheckboxCircleLine'
                  : 'CheckboxBlankCircleLine'
              }
              active={isSelected(getItemFile(interfaceData))}
              onClick={() => {
                onItemClick([getItemFile(interfaceData)], isSelected(getItemFile(interfaceData)));
              }}
              badge={interfaceData.data?.version ? `[v${interfaceData.data.version}] ` : undefined}
              effect={
                isSelected(getItemFile(interfaceData))
                  ? {
                      gradient: {
                        colors: {
                          0: 'main',
                          160: 'info:lighten',
                        },
                      },
                    }
                  : undefined
              }
            >
              {interfaceData.data?.name || interfaceData.name}
            </ReqoreButton>
          ))}
        </ReqoreControlGroup>
      </ReqorePanel>
    </StyledInterfaceItem>
  );
};

export const CustomRelease = ({ selected, onItemClick }: ICustomReleaseProps) => {
  const t = useContext<(text: string) => string>(TextContext);

  // Fetch all the interfaces on mount
  const { value, loading, error } = useAsyncRetry<{ [key: string]: { [key: string]: any }[] }>(
    async () => {
      const data = await callBackendBasic('get-all-interfaces');

      if (!data.ok) {
        throw new Error('Error fetching interfaces');
      }

      return data.data;
    }
  );

  if (loading) {
    return <Loader text="Loading..." />;
  }

  const getItemFile = (item: any): string => {
    return item.data.yaml_file || item.data.path;
  };

  const handleSelectAll = (interfaceKind: string) => {
    onItemClick(value?.[interfaceKind].map((item) => getItemFile(item)) || []);
  };

  return (
    <StyledCustomReleaseWrapper>
      {map(value, (interfaces, interfaceKind) => (
        <CustomReleaseGroup
          key={interfaceKind}
          selected={selected}
          onItemClick={onItemClick}
          interfaceKind={interfaceKind}
          interfaces={interfaces}
          onSelectAll={handleSelectAll}
          getItemFile={getItemFile}
        />
      ))}
    </StyledCustomReleaseWrapper>
  );
};
