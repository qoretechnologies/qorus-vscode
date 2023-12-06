// @flow
import {
  ReqoreCollection,
  ReqoreMessage,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreTree,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import map from 'lodash/map';
import React, { useEffect, useState } from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import { isNull, isUndefined } from 'util';
import ContentByType from '../../components/ContentByType';
//import ConfigItemsModal from './modal';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { size } from 'lodash';
import { getTypeFromValue, maybeParseYaml } from '../../helpers/validations';
import withTextContext from '../../hocomponents/withTextContext';
import Modal from './modal';

type ConfigItemsTableProps = {
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

export const zoomToSize = {
  0: 'tiny',
  0.5: 'small',
  1: 'normal',
  1.5: 'big',
  2: 'huge',
};

export const zoomToWidth = {
  0: '200px',
  0.5: '300px',
  1: '400px',
  1.5: '500px',
  2: '600px',
};

// This code converts a zoom level to a label.
export const zoomToLabel = {
  0: '50%',
  0.5: '100%',
  1: '150%',
  1.5: '200%',
  2: '250%',
};

const ConfigItemsTable: Function = (props: ConfigItemsTableProps) => {
  return (
    <React.Fragment>
      {!size(props.isGrouped ? props.data : props.unGroupedData) ? (
        <ReqoreMessage icon="Search2Line" flat>
          No local config items found {props.query ? `for query "${props.query}"` : ''}
        </ReqoreMessage>
      ) : null}
      {props.isGrouped && size(props.data)
        ? map(props.data, (configItemsData, groupName) => (
            <>
              <ItemsTable
                {...props}
                groupName={groupName}
                configItemsData={configItemsData}
                title={groupName}
                onGroupClick={() => {
                  props.handleGroupedToggle();
                }}
              />
              <ReqoreVerticalSpacer height={10} />
            </>
          ))
        : null}
      {!props.isGrouped && size(props.unGroupedData) ? (
        <ItemsTable
          {...props}
          configItemsData={props.unGroupedData}
          onGroupClick={() => {
            props.handleGroupedToggle();
          }}
        />
      ) : null}
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
};

export const getItemType = (type, value) => {
  let result = type;

  if (type === 'any' || type === 'auto') {
    result = getTypeFromValue(maybeParseYaml(value));
  }

  return result;
};

export const Value = ({ item, useDefault }: any) => {
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
    const parsedValue = maybeParseYaml(value);

    if (!parsedValue) {
      return <span> null </span>;
    }

    return <ReqoreTree showControls={false} data={maybeParseYaml(yamlValue)} />;
  }

  return <ContentByType inTable content={value} baseType={type} />;
};

let ItemsTable: Function = ({
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
  zoom,
  itemsPerPage,
  onGroupClick,
  query,
}: ConfigItemsTableProps) => {
  const isInitialItemValueSame = (item) => {
    const initialItem = initialItems.find((inItem) => {
      return inItem.name === item.name && inItem.config_group === item.config_group;
    });

    if (!initialItem) {
      return false;
    }

    return initialItem.value === item.value;
  };

  return (
    <React.Fragment>
      <ReqoreCollection
        label={groupName || 'All config items'}
        sortable
        icon="PriceTagFill"
        maxItemHeight={250}
        minColumnWidth={zoomToWidth[zoom]}
        responsiveActions={false}
        responsiveTitle
        inputInTitle={false}
        inputProps={{
          fluid: true,
        }}
        actions={[
          {
            label: groupName ? 'Ungroup items' : 'Group items',
            icon: groupName ? 'Apps2Line' : 'BubbleChartLine',
            onClick: () => {
              onGroupClick();
            },
          },
        ]}
        paging={
          itemsPerPage
            ? {
                infinite: true,
                loadMoreLabel: 'Load more...',
                showLabels: true,
                itemsPerPage,
              }
            : undefined
        }
        items={configItemsData.map(
          (item): IReqoreCollectionItemProps => ({
            label: item.name,
            size: zoomToSize[zoom],
            tooltip: {
              content: item.description,
              delay: 300,
            },
            intent:
              !item.value && item.value !== 0 && !item.is_set
                ? 'danger'
                : !isInitialItemValueSame(item)
                ? 'success'
                : undefined,
            onClick: definitionsOnly
              ? undefined
              : () => {
                  handleModalToggle(
                    { ...item },
                    (name, value, parent, isTemplatedString, remove, currentType) => {
                      onSubmit(name, value, parent, type, isTemplatedString, remove, currentType);
                      handleModalToggle(null);
                    },
                    intrf,
                    levelType
                  );
                },
            actions: [
              {
                icon: 'CloseLine',
                tooltip: 'Clear',
                intent: 'warning',
                show: 'hover',
                disabled:
                  definitionsOnly || (item.level ? !item.level.startsWith(levelType || '') : true),
                onClick: () => {
                  onSubmit(
                    item.name,
                    null,
                    item.parent_class,
                    type,
                    item.is_templated_string,
                    true
                  );
                },
              },
              {
                icon: 'EditLine',
                tooltip: 'Edit config item structure',
                show: 'hover',
                onClick: () => {
                  onEditStructureClick(item.name);
                },
              },
              {
                icon: 'DeleteBinLine',
                tooltip: 'Delete config item',
                show: item.parent_class ? false : 'hover',
                intent: 'danger',
                onClick: () => {
                  onDeleteStructureClick(item.name);
                },
              },
            ],
            content: (
              <>
                <Value item={item} />
                <ReqoreVerticalSpacer height={15} />
                <ReqoreTagGroup size={zoomToSize[zoom]}>
                  {item.parent_class ? (
                    <ReqoreTag labelKey="Parent" icon="CodeBoxFill" label={item.parent_class} />
                  ) : null}
                  <ReqoreTag labelKey="Type" label={item.type} icon="CodeLine" />
                </ReqoreTagGroup>
              </>
            ),
          })
        )}
      />
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
    unGroupedData: configItems.data.filter((item) => {
      if (rest.query) {
        return (
          item.name.toLowerCase().includes(rest.query.toLowerCase()) ||
          item.description.toLowerCase().includes(rest.query.toLowerCase())
        );
      }

      return item;
    }),
    data: configItems.data
      .filter((item) => {
        if (rest.query) {
          return (
            item.name.toLowerCase().includes(rest.query.toLowerCase()) ||
            item.description.toLowerCase().includes(rest.query.toLowerCase())
          );
        }

        return item;
      })
      .reduce((newItems, item) => {
        // Check if this group exists
        if (!newItems[item.config_group]) {
          newItems[item.config_group] = [];
        }
        // Push the item
        newItems[item.config_group].push(item);
        return newItems;
      }, {}),
    configItems,
    ...rest,
  })),
  onlyUpdateForKeys(['configItems', 'showDescription', 'isGrouped', 'modalData', 'query'])
)(ConfigItemsTable);
