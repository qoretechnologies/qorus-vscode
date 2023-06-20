import { ReqoreCollection, ReqoreSpinner, useReqoreProperty } from '@qoretechnologies/reqore';
import { capitalize } from 'lodash';
import { useContext, useMemo } from 'react';
import { useMeasure } from 'react-use';
import { IQorusInterface } from '.';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  SelectorColorEffect,
  WarningColorEffect,
} from '../../components/Field/multiPair';
import {
  interfaceIcons,
  interfaceKindTransform,
  interfaceToPlural,
} from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { deleteDraft } from '../../helpers/functions';
import { postMessage } from '../../hocomponents/withMessageHandler';
import { useFetchInterfaces } from '../../hooks/useFetchInterfaces';
import { InterfacesViewItem } from './item';

export interface IInterfaceViewCollectionProps {
  type: string;
  items: IQorusInterface[];
  showRemotes?: boolean;
}

export const InterfacesViewCollection = ({
  type,
  items,
  showRemotes,
}: IInterfaceViewCollectionProps) => {
  const addNotification = useReqoreProperty('addNotification');
  const confirmAction = useReqoreProperty('confirmAction');
  const { changeDraft, changeTab, qorus_instance } = useContext(InitialContext);
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();

  const { value, loading } = useFetchInterfaces(
    qorus_instance && showRemotes,
    interfaceToPlural[type],
    items
  );

  const onDeleteClick = async (interfaceKind, interfaceId?) => {
    await deleteDraft(interfaceKindTransform[interfaceKind], interfaceId, true, addNotification);
  };

  const onDeployClick = (data) => {
    postMessage(Messages.DEPLOY_INTERFACE, { data });
  };

  const itemsPerPage = useMemo(() => {
    return Math.floor(width / 400) * Math.floor(height / 65) || 100;
  }, [width, height]);

  if (loading) {
    return <ReqoreSpinner size="big">Loading server data...</ReqoreSpinner>;
  }

  return (
    <ReqoreCollection
      label={capitalize(interfaceToPlural[type]).replace('-', ' ')}
      sortable
      getContentRef={ref}
      filterable
      minimal
      maxItemHeight={200}
      responsiveActions={false}
      fill
      paging={{
        infinite: true,
        loadMoreLabel: 'Load more...',
        showLabels: true,
        itemsPerPage,
      }}
      actions={[
        {
          icon: 'AddCircleLine',
          tooltip: `Create new ${type}`,
          minimal: true,
          flat: false,
          onClick: () => changeTab('CreateInterface', type),
          effect: PositiveColorEffect,
        },
        {
          icon: 'DeleteBin6Fill',
          tooltip: 'Delete drafts',
          effect: WarningColorEffect,
          minimal: true,
          flat: false,
          onClick: () => {
            onDeleteClick(type);
          },
        },
      ]}
      icon={interfaceIcons[type]}
      inputProps={{
        focusRules: {
          type: 'keypress',
          shortcut: 'letters',
        },
      }}
      items={value.map(({ name, data, isDraft, hasDraft, isServerInterface, ...rest }, index) => ({
        label: name,
        icon: isServerInterface ? 'ServerLine' : isDraft || hasDraft ? 'EditLine' : 'FileLine',
        iconColor: isServerInterface
          ? '#6f1977:lighten:2'
          : isDraft || hasDraft
          ? 'pending'
          : undefined,
        content: (
          <InterfacesViewItem
            {...rest}
            data={data}
            isDraft={isDraft}
            hasDraft={hasDraft}
            name={name}
            isServerInterface={isServerInterface}
          />
        ),
        responsiveTitle: false,
        responsiveActions: false,
        b: [],
        size: 'small',
        intent: isDraft || hasDraft ? 'pending' : undefined,
        onClick: () => {
          if (isServerInterface) {
            return;
          }

          if (isDraft) {
            changeDraft({
              interfaceKind: type,
              interfaceId: rest.interfaceId,
            });
          } else {
            postMessage(Messages.GET_INTERFACE_DATA, {
              iface_kind: type,
              name,
              include_tabs: true,
            });
          }
        },
        actions: [
          {
            icon: 'UploadLine',
            effect: PositiveColorEffect,
            tooltip: 'Deploy',
            show: !isDraft ? 'hover' : false,
            onClick: () => onDeployClick(data),
          },
          {
            icon: 'FileEditLine',
            effect: SelectorColorEffect,
            tooltip: 'Edit code',
            show: !!data?.code ? 'hover' : false,
          },
          {
            icon: 'DeleteBinLine',
            effect: NegativeColorEffect,
            tooltip: 'Delete',
            show: 'hover',
            onClick: () => {
              if (isDraft) {
                confirmAction({
                  title: 'Delete draft',
                  description: 'Are you sure you want to delete this draft?',
                  onConfirm: () => {
                    onDeleteClick(type, rest.interfaceId);
                  },
                });
              } else {
                confirmAction({
                  title: 'Delete interface',
                  description: 'Are you sure you want to delete this interface?',
                  onConfirm: () => {
                    postMessage(Messages.DELETE_INTERFACE, { iface_kind: type, name });
                  },
                });
              }
            },
          },
        ],
      }))}
    />
  );
};
