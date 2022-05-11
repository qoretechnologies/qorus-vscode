import { Button, Classes, Colors, ControlGroup, Icon } from '@blueprintjs/core';
import { map, size } from 'lodash';
import React, { useContext, useState } from 'react';
import { useAsyncRetry, useBoolean } from 'react-use';
import styled, { css } from 'styled-components';
import StringField from '../components/Field/string';
import Loader from '../components/Loader';
import { MENU } from '../constants/menu';
import { TextContext } from '../context/text';
import { callBackendBasic } from '../helpers/functions';

const StyledCustomReleaseWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
  flex-flow: column;
`;

const StyledInterfaceListTitle = styled.div`
  padding: 10px 10px;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;

  transition: all 0.2s linear;
  cursor: pointer;

  &:hover {
    background-color: #e5f0fe !important;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}

  > div:first-child {
    svg {
      margin-right: 10px;
    }

    span {
      margin-left: 10px;
    }
  }
`;

const StyledInterfaceItem = styled.div`
  border: 1px solid #e6e6e6;
  border-radius: 3px;
  margin-bottom: 20px;
`;

const StyledInterfaceListItem = styled.div`
  padding: 6px 10px;
  transition: all 0.2s linear;
  cursor: pointer;

  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:hover {
    background-color: #c5daf6 !important;
  }

  ${({ selected }) =>
    selected &&
    css`
      background-color: #d4e6fe;
      svg {
        fill: ${Colors.BLUE3} !important;
      }
      &:nth-child(even) {
        background-color: #e1eeff;
      }
    `}
`;

export interface ICustomReleaseProps {
  selected: string[];
  onItemClick: (item: string[], isDeselect?: boolean) => void;
}

export const otherInterfaceIcons = {
  'schema-modules': 'database',
  scripts: 'shapes',
  tests: 'lab-test',
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
    <StyledInterfaceItem key={interfaceKind}>
      <StyledInterfaceListTitle
        disabled={!size(interfaces)}
        onClick={() => {
          // Add this interface to the collapsed list if it's not already there
          // and remove it if it is
          setIsCollapsed(!isCollapsed);
        }}
      >
        <div>
          <Icon
            iconSize={18}
            icon={size(interfaces) ? (isCollapsed ? 'chevron-right' : 'chevron-down') : 'disable'}
          />{' '}
          <Icon
            iconSize={18}
            icon={
              MENU.CreateInterface[0].submenu.find(
                (interfaceMenuData) => interfaceMenuData.subtab === interfaceKind
              )?.icon || otherInterfaceIcons[interfaceKind]
            }
          />{' '}
          {MENU.CreateInterface[0].submenu.find(
            (interfaceMenuData) => interfaceMenuData.subtab === interfaceKind
          )?.name || otherInterfaceNames[interfaceKind]}{' '}
          <span className={Classes.TEXT_MUTED}>({filteredInterfaces.length})</span>
        </div>
        {size(interfaces) > 0 && (
          <ControlGroup>
            <StringField
              name="query"
              value={query}
              onChange={(n, q) => setQuery(q)}
              placeholder={t('Filter')}
            />
            {size(filteredInterfaces) > 0 && (
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  if (query && query !== '') {
                    handleSelectFiltered();
                  } else {
                    onSelectAll(interfaceKind);
                  }
                }}
                intent="primary"
                icon="multi-select"
              >
                {query && query !== '' ? t('SelectFiltered') : t('SelectAll')}
              </Button>
            )}
          </ControlGroup>
        )}
      </StyledInterfaceListTitle>
      {!isCollapsed
        ? map(filteredInterfaces, (interfaceData, index) => (
            <StyledInterfaceListItem
              key={index}
              selected={isSelected(getItemFile(interfaceData))}
              onClick={() => {
                onItemClick([getItemFile(interfaceData)], isSelected(getItemFile(interfaceData)));
              }}
            >
              <Icon
                iconSize={15}
                style={{ marginRight: 10 }}
                icon={isSelected(getItemFile(interfaceData)) ? 'tick-circle' : 'circle'}
              />
              <span className={Classes.TEXT_MUTED}>
                {interfaceData.data?.version && `[v${interfaceData.data.version}] `}
              </span>
              {interfaceData.data?.name || interfaceData.name}
            </StyledInterfaceListItem>
          ))
        : null}
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
