import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTable,
  ReqoreTag,
  ReqoreTree,
  ReqoreVerticalSpacer,
  useReqore,
} from '@qoretechnologies/reqore';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import { isNull, isUndefined } from 'util';
import ContentByType from '../../components/ContentByType';
//import ConfigItemsModal from './modal';
import {
  IReqoreTableColumn,
  IReqoreTableProps,
} from '@qoretechnologies/reqore/dist/components/Table';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { InitialContext } from '../../context/init';
import { getTypeFromValue, maybeParseYaml } from '../../helpers/validations';
import withTextContext from '../../hocomponents/withTextContext';
import Modal from './modal';

export type ConfigItemsTableProps = {
  items: Object;
  dispatchAction: Function;
  intrf: string;
  openModal: Function;
  closeModal: Function;
  onSubmit: Function;
  belongsTo: string;
  showDescription: boolean;
  levelType: string;
  stepId?: number;
  type: string;
  definitionsOnly?: boolean;
  disableAdding?: boolean;
};

export const StyledTable: React.FC<IReqoreTableProps> = styled(
  ReqoreTable && typeof ReqoreTable === 'object' ? ReqoreTable : 'div'
)`
  .reqore-table-body {
    height: unset !important;
  }
`;

export const ConfigItemsTable: Function = (props: ConfigItemsTableProps) => (
  <React.Fragment>
    <ReqoreControlGroup fluid>
      <ReqoreButton
        onClick={props.handleGroupedToggle}
        icon={props.isGrouped ? 'ListUnordered' : 'Group2Line'}
        rightIcon={props.isGrouped ? 'ListUnordered' : 'Group2Line'}
      >
        {props.isGrouped ? 'Show all config items' : 'Show config items by group'}
      </ReqoreButton>
    </ReqoreControlGroup>
    <ReqoreVerticalSpacer height={10} />
    {props.isGrouped && size(props.data) ? (
      map(props.data, (configItemsData, groupName) => (
        <>
          <ItemsTable
            {...props}
            groupName={groupName}
            configItemsData={configItemsData}
            title={groupName}
          />
          <ReqoreVerticalSpacer height={10} />
        </>
      ))
    ) : (
      <ItemsTable {...props} configItemsData={props.configItems.data} />
    )}
    {props.modalData && (
      <Modal
        onClose={props.handleModalToggle}
        item={{ ...props.modalData.item }}
        onSubmit={props.modalData.onSubmit}
        intrf={props.modalData.intrf}
        levelType={props.modalData.levelType}
      />
    )}
  </React.Fragment>
);

export const getItemType = (type, value) => {
  let result = type;

  if (type === 'any' || type === 'auto') {
    result = getTypeFromValue(maybeParseYaml(value));
  }

  return result;
};

export const Value = ({ item, useDefault }) => {
  const [showValue, setShowValue] = useState(!item.sensitive);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timer>(null);

  useEffect(() => {
    setShowValue(!item.sensitive);
  }, [item.sensitive]);

  useEffect(() => {
    return () => {
      clearTimeout(hideTimer);
    };
  }, [hideTimer]);

  const value = useDefault ? item.default_value : item.value;
  const yamlValue = useDefault ? item.yamlData.default_value : item.yamlData.value;

  if (!showValue) {
    return (
      <div
        onClick={() => {
          setHideTimer(() => {
            return setTimeout(() => {
              setShowValue(false);
            }, 30000);
          });
          setShowValue(true);
        }}
        style={{
          position: 'absolute',
          width: '70%',
          top: '5px',
          bottom: '5px',
          left: '5px',
          backgroundColor: '#000',
          cursor: 'pointer',
          color: '#fff',
          textAlign: 'center',
          verticalAlign: 'middle',
        }}
      >
        {' '}
        Click to reveal{' '}
      </div>
    );
  }

  if (isUndefined(value)) {
    return <span> - </span>;
  }
  if (isNull(value)) {
    return <span> null </span>;
  }
  if (item.is_templated_string) {
    return <ContentByType inTable content={maybeParseYaml(value)} />;
  }

  const type =
    item.type === 'auto' || item.type === 'any'
      ? item.value_true_type || getItemType(item.type, yamlValue)
      : item.type;

  if (type === 'hash' || type === 'list') {
    return <ReqoreTree showControls={false} data={maybeParseYaml(yamlValue)} />;
  }

  return <ContentByType inTable content={value} baseType={type} />;
};

export let ItemsTable: Function = ({
  onSubmit,
  intrf,
  showDescription,
  handleToggleDescription,
  levelType,
  configItemsData,
  title,
  groupName,
  handleModalToggle,
  handleGroupedToggle,
  onEditStructureClick,
  onDeleteStructureClick,
  t,
  type,
  definitionsOnly,
  disableAdding,
  initialItems,
}: ConfigItemsTableProps) => {
  const initContext = useContext(InitialContext);
  const { isMobileOrTablet } = useReqore();

  const isInitialItemValueSame = (item) => {
    const initialItem = initialItems.find(
      (inItem) => inItem.name === item.name && inItem.group === item.group
    );

    if (!initialItem) {
      return false;
    }

    return initialItem.value === item.value;
  };

  const columns = () => {
    let cols: IReqoreTableColumn[] = [
      {
        dataId: 'name',
        header: t('Name'),
        grow: 2,
        sortable: true,
        cellTooltip: (data) => {
          return (
            <>
              <ReqoreMessage intent="info" size="small" title={data.name}>
                <ReactMarkdown>{data.description}</ReactMarkdown>
              </ReqoreMessage>
              <ReqoreVerticalSpacer height={10} />
              <Value item={data} />
            </>
          );
        },
      },
    ];

    if (!groupName) {
      cols = [
        ...cols,
        {
          dataId: 'config_group',
          header: t('Group'),
          sortable: true,
          cellTooltip(data) {
            return data.config_group;
          },
        },
      ];
    }

    cols = [
      ...cols,
      {
        dataId: 'value',
        header: t('Value'),
        sortable: true,
        cellTooltip(data) {
          return (
            <>
              <ReqoreMessage intent="info" size="small" title={data.name}>
                <ReactMarkdown>{data.description}</ReactMarkdown>
              </ReqoreMessage>
              <ReqoreVerticalSpacer height={10} />
              <Value item={data} />
            </>
          );
        },
      },
      {
        dataId: '_actions',
        header: t('Actions'),
        width: 150,
        align: 'center',
        content: (item) => (
          <ReqoreControlGroup stack size="small">
            <ReqoreButton
              icon="EditLine"
              tooltip={t('button.edit-this-value')}
              disabled={definitionsOnly}
              onClick={() => {
                handleModalToggle(
                  { ...item },
                  (name, value, parent, isTemplatedString, remove, currentType) => {
                    onSubmit(name, value, parent, type, isTemplatedString, remove, currentType);
                    handleModalToggle(null);
                  },
                  intrf,
                  levelType
                );
              }}
            />
            <ReqoreButton
              icon="CloseLine"
              intent={'warning'}
              tooltip={t('button.remove-this-value')}
              disabled={
                definitionsOnly || (item.level ? !item.level.startsWith(levelType || '') : true)
              }
              onClick={() => {
                onSubmit(item.name, null, item.parent_class, type, item.is_templated_string, true);
              }}
            />
            <ReqoreButton
              icon="SettingsLine"
              title={t('button.edit-this-config-item')}
              disabled={disableAdding}
              onClick={() => {
                onEditStructureClick(item.name);
              }}
            />

            {!item.parent && (
              <ReqoreButton
                intent="danger"
                icon="DeleteBinLine"
                disabled={disableAdding}
                onClick={() => {
                  initContext.confirmAction('ConfirmRemoveConfigItem', () => {
                    onDeleteStructureClick(item.name);
                  });
                }}
              />
            )}
          </ReqoreControlGroup>
        ),
      },
    ];

    if (!isMobileOrTablet) {
      cols = [
        ...cols,
        {
          dataId: 'stricly_local',
          header: t('Strictly local'),
          sortable: true,
          content: (item) => <>{item.stricly_local ? 'Yes' : 'No'}</>,
          align: 'center',
          width: 100,
        },
        {
          dataId: 'level',
          header: t('Level'),
          sortable: true,
          content: ({ level }) => <ReqoreTag size="small" icon="NodeTree" label={level} />,
          align: 'center',
          width: 100,
        },
        {
          dataId: 'type',
          header: t('Type'),
          sortable: true,
          width: 100,
          align: 'center',
          content: ({ type, can_be_undefined }) => (
            <ReqoreTag
              size="small"
              icon="CodeLine"
              label={`${can_be_undefined ? '*' : ''}${type}`}
            />
          ),
        },
      ];
    }

    return cols;
  };

  return (
    <React.Fragment>
      <ReqorePanel
        label={groupName}
        minimal
        transparent
        flat
        collapsible={groupName}
        icon={groupName ? 'Settings5Fill' : undefined}
      >
        <StyledTable
          rounded
          striped
          sort={{
            by: 'name',
            direction: 'asc',
          }}
          columns={columns()}
          data={
            Array.isArray(configItemsData) &&
            configItemsData.map((item) => ({
              ...item,
              _intent:
                !item.value && !item.is_set
                  ? 'danger'
                  : !isInitialItemValueSame(item)
                  ? 'success'
                  : undefined,
            }))
          }
        />
      </ReqorePanel>
    </React.Fragment>
  );
};

ItemsTable = compose(
  withState('showDescription', 'toggleDescription', false),
  withHandlers({
    handleToggleDescription:
      ({ toggleDescription }) =>
      () => {
        toggleDescription((value) => !value);
      },
  }),
  withTextContext()
)(ItemsTable);

export default compose(
  withState('modalData', 'toggleModalData', null),
  withState('isGrouped', 'setIsGrouped', true),
  withHandlers({
    handleModalToggle:
      ({ toggleModalData }) =>
      (item, onSubmit, intrf, levelType) => {
        toggleModalData((value) =>
          value
            ? null
            : {
                item,
                onSubmit,
                intrf,
                levelType,
              }
        );
      },
    handleGroupedToggle:
      ({ setIsGrouped }) =>
      () => {
        setIsGrouped((value) => !value);
      },
  }),
  mapProps(({ configItems, ...rest }) => ({
    data: reduce(
      configItems.data,
      (newItems, item) => {
        // Check if this group exists
        if (!newItems[item.config_group]) {
          newItems[item.config_group] = [];
        }
        // Push the item
        newItems[item.config_group].push(item);
        return newItems;
      },
      {}
    ),
    configItems,
    ...rest,
  })),
  onlyUpdateForKeys(['configItems', 'showDescription', 'isGrouped', 'modalData'])
)(ConfigItemsTable);
