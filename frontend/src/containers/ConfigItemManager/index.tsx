import { ReqoreInput, ReqorePanel } from '@qoretechnologies/reqore';
import { IReqoreInputProps } from '@qoretechnologies/reqore/dist/components/Input';
import { reduce, size } from 'lodash';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useMount } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import CustomDialog from '../../components/CustomDialog';
import { PositiveColorEffect, SynthColorEffect } from '../../components/Field/multiPair';
import { Messages } from '../../constants/messages';
import InterfaceCreatorPanel from '../../containers/InterfaceCreator/panel';
import { getFilteredItems } from '../../helpers/common';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
  addMessageListener,
  postMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import { ConfigItemsManagerFilters } from './filters';
import GlobalTable from './globalTable';
import ConfigItemsTable, { zoomToLabel } from './table';

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

const ConfigItemManager: FunctionComponent<IConfigItemManager> = ({
  t,
  type,
  baseClassName,
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
  const [zoom, setZoom] = useState(0.5);
  const [query, setQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
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
      const configItemsCount = size([...data.items, ...data.global_items, ...data.workflow_items]);

      if (configItemsCount > 100) {
        // The larger the number of items, the smaller the paging
        // When the count is 100 the paging is 50, when the count is 500 the paging is 10
        const pages = Math.floor(100 / Math.floor(configItemsCount / 50));
        setItemsPerPage(pages < 10 ? 10 : pages);
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
      itemsListener();
      itemListener();
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
      {showFilters && (
        <ConfigItemsManagerFilters
          filters={filters}
          onSubmit={(filters) => setFilters(filters)}
          localItems={configItems.items}
          globalItems={configItems.global_items}
          workflowItems={configItems.workflow_items}
          onClose={() => setShowFilters(false)}
        />
      )}
      <ReqorePanel
        flat
        fill
        transparent
        actions={[
          {
            fluid: true,
            as: ReqoreInput,
            props: {
              fluid: true,
              icon: 'SearchLine',
              placeholder: 'Search',
              className: 'config-items-search',
              onClearClick: () => setQuery(''),
              value: query,
              effect: query ? SynthColorEffect : undefined,
              onChange: (e) => setQuery(e.target.value),
              focusRules: {
                type: 'auto',
              },
            } as IReqoreInputProps,
          },
          {
            fluid: false,
            group: [
              {
                icon: 'FilterLine',
                tooltip: 'Filter config items',
                label: 'Filters',
                className: 'config-items-filters',
                onClick: () => setShowFilters(!showFilters),
                flat: !size(filters),
                effect: size(filters) ? SynthColorEffect : undefined,
                badge: reduce(filters, (count, filters) => count + size(filters), 0),
              },
              {
                icon: 'CloseLine',
                flat: !size(filters),
                effect: size(filters) ? SynthColorEffect : undefined,
                tooltip: 'Clear filters',
                className: 'config-items-filters-reset',
                show: !!size(filters),
                onClick: () => setFilters({}),
              },
            ],
          },
          {
            fluid: false,
            group: [
              {
                icon: 'ZoomInLine',
                tooltip: 'Zoom in',
                disabled: zoom === 2,
                className: 'config-items-zoom-in',
                onClick: () => {
                  setZoom(zoom + 0.5);
                },
              },
              {
                icon: 'RestartLine',
                label: zoomToLabel[zoom],
                tooltip: 'Reset zoom',
                disabled: zoom === 0.5,
                className: 'config-items-zoom-reset',
                onClick: () => {
                  setZoom(0.5);
                },
              },
              {
                icon: 'ZoomOutLine',
                tooltip: 'Zoom out',
                disabled: zoom === 0,
                className: 'config-items-zoom-out',
                onClick: () => {
                  setZoom(zoom - 0.5);
                },
              },
            ],
          },
          {
            label: 'Add Config Item',
            icon: 'AddLine',
            effect: PositiveColorEffect,
            onClick: () => setShowConfigItemPanel(true),
            show: type !== 'workflow' && !disableAdding,
          },
        ]}
      >
        <div>
          {configItems.global_items && (
            <GlobalTable
              zoom={zoom}
              query={query}
              itemsPerPage={itemsPerPage}
              definitionsOnly={definitionsOnly}
              configItems={getFilteredItems(configItems.global_items, filters)}
              initialItems={initialConfigItems.current.global_items}
              onSubmit={handleSubmit}
            />
          )}
          {(type === 'step' || type === 'workflow') && configItems.workflow_items ? (
            <GlobalTable
              zoom={zoom}
              query={query}
              itemsPerPage={itemsPerPage}
              definitionsOnly={definitionsOnly}
              configItems={getFilteredItems(configItems.workflow_items, filters)}
              initialItems={initialConfigItems.current.workflow_items}
              workflow
              onSubmit={handleSubmit}
            />
          ) : null}
          {configItems.items && type !== 'workflow' ? (
            <ConfigItemsTable
              zoom={zoom}
              query={query}
              itemsPerPage={itemsPerPage}
              configItems={{
                data: getFilteredItems(configItems.items, filters),
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
      </ReqorePanel>
    </>
  );
};

export default compose(withTextContext(), withMessageHandler())(ConfigItemManager);
