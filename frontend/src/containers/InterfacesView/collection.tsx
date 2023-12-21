import { ReqoreCollection, useReqoreProperty } from '@qoretechnologies/reqore';
import { TReqoreBadge } from '@qoretechnologies/reqore/dist/components/Button';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { capitalize, size } from 'lodash';
import { useContext, useMemo } from 'react';
import { IQorusInterface } from '.';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  SelectorColorEffect,
  WarningColorEffect,
} from '../../components/Field/multiPair';
import Loader from '../../components/Loader';
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
import { zoomToSize, zoomToWidth } from '../ConfigItemManager/table';
import { InterfacesViewItem } from './item';

export interface IInterfaceViewCollectionProps {
  type: string;
  items: IQorusInterface[];
  showRemotes?: boolean;
  zoom: number;
  isOther: boolean;
}

export const InterfacesViewCollection = ({
  type,
  items,
  showRemotes,
  zoom,
  isOther,
}: IInterfaceViewCollectionProps) => {
  const addNotification = useReqoreProperty('addNotification');
  const confirmAction = useReqoreProperty('confirmAction');
  const { changeDraft, changeTab, qorus_instance, is_hosted_instance } = useContext(InitialContext);

  const { value, loading, onDeleteRemoteClick } = useFetchInterfaces(
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
    return 50;
  }, []);

  const getItemsCount = () => {
    return size(value.filter((item) => !item.isDraft && item.isLocalInterface));
  };

  const getRemotesCount = () => {
    return size(value.filter((item) => item.isServerInterface));
  };

  const getDraftsCount = () => {
    return size(value.filter((item) => item.isDraft || item.hasDraft));
  };

  const badges = useMemo(() => {
    const badgeList: TReqoreBadge[] = [
      {
        labelKey: 'Local',
        label: getItemsCount(),
        intent: 'info',
      },
    ];

    if (!isOther) {
      badgeList.push({ labelKey: 'Drafts', label: getDraftsCount(), intent: 'pending' });
    }

    if (qorus_instance && showRemotes) {
      badgeList.push({
        labelKey: 'Remotes',
        label: getRemotesCount(),
        color: '#6f1977',
      });
    }

    return badgeList;
  }, [getItemsCount, getDraftsCount, showRemotes, getRemotesCount, qorus_instance]);

  const buildTags = ({
    isDraft,
    hasDraft,
    isLocalInterface,
    isServerInterface,
  }: Partial<IQorusInterface>) => {
    let tags: IReqoreCollectionItemProps['tags'] = [];

    if (isDraft) {
      tags.push({
        icon: 'StarLine',
        label: 'New',
        intent: 'success',
      });
    }

    if (hasDraft) {
      tags.push({
        icon: 'Edit2Line',
        label: 'Draft',
        intent: 'pending',
      });
    }

    if (isLocalInterface && isServerInterface) {
      tags.push({
        icon: 'FileLine',
        rightIcon: 'ServerLine',
        effect: {
          gradient: {
            colors: {
              0: 'info',
              100: '#6f1977',
            },
          },
        },
        label: 'Local & Remote',
      });
    } else {
      if (isLocalInterface) {
        tags.push({
          icon: 'FileLine',
          intent: 'info',
          label: 'Local',
        });
      }

      if (isServerInterface) {
        tags.push({
          icon: 'ServerLine',
          color: '#6f1977',
          label: 'Remote',
        });
      }
    }

    return tags;
  };

  // Sort the value by isDraft / hasDraft boolean, put values with truthy isServerInterface at the end and sort the rest by name
  const sortedValue = useMemo(() => {
    return value.sort((a, b) => {
      if (a.isDraft && !b.isDraft) {
        return -1;
      }

      if (!a.isDraft && b.isDraft) {
        return 1;
      }

      if (a.hasDraft && !b.hasDraft) {
        return -1;
      }

      if (!a.hasDraft && b.hasDraft) {
        return 1;
      }

      if (a.isServerInterface && !b.isServerInterface) {
        return 1;
      }

      if (!a.isServerInterface && b.isServerInterface) {
        return -1;
      }

      return a.name.localeCompare(b.name);
    });
  }, [value]);

  if (loading) {
    return <Loader text="Loading server data..." />;
  }

  return (
    <ReqoreCollection
      label={capitalize(interfaceToPlural[type]).replace('-', ' ')}
      filterable
      sortable={false}
      minimal
      minColumnWidth={zoomToWidth[zoom]}
      badge={badges}
      maxItemHeight={120}
      responsiveActions={false}
      fill
      // paging={{
      //   infinite: true,
      //   loadMoreLabel: 'Load more...',
      //   loadMoreButtonProps: {
      //     badge: undefined,
      //   },
      //   showLabels: true,
      //   itemsPerPage,
      // }}
      actions={[
        {
          icon: 'AddCircleLine',
          tooltip: `Create new ${type}`,
          label: 'Create new',
          minimal: true,
          show: !isOther,
          flat: false,
          onClick: () => changeTab('CreateInterface', type),
          effect: PositiveColorEffect,
        },
        {
          icon: 'DeleteBin6Fill',
          tooltip: `Delete ${type} drafts`,
          effect: WarningColorEffect,
          minimal: true,
          show: !isOther,
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
      items={sortedValue.map(
        (
          { name, data, isDraft, hasDraft, isServerInterface, isLocalInterface, ...rest },
          index
        ): IReqoreCollectionItemProps => ({
          label: data?.display_name || name || data.error,
          icon: interfaceIcons[type],
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
          contentEffect: {
            gradient: {
              direction: 'to right bottom',
              colors: {
                50: 'main',
                300: isDraft
                  ? 'success'
                  : hasDraft
                  ? 'pending'
                  : isServerInterface
                  ? '#6f1977'
                  : 'info:lighten:2',
              },
            },
          },
          flat: true,
          responsiveTitle: false,
          responsiveActions: false,
          expandable: isServerInterface && !is_hosted_instance,
          size: zoomToSize[zoom],
          onClick: () => {
            if (isLocalInterface || isServerInterface) {
              postMessage(
                Messages.GET_INTERFACE_DATA,
                {
                  iface_kind: type,
                  name,
                  include_tabs: true,
                },
                true
              );

              return;
            }

            if (isDraft) {
              changeDraft({
                interfaceKind: type,
                interfaceId: rest.interfaceId,
              });

              return;
            }

            return;
          },
          tags: buildTags({
            isDraft,
            hasDraft,
            isServerInterface,
            isLocalInterface,
            data,
          }),
          actions: [
            {
              icon: 'UploadLine',
              effect: PositiveColorEffect,
              tooltip: 'Deploy',
              size: 'tiny',
              show: isLocalInterface ? 'hover' : false,
              onClick: () => onDeployClick(data),
            },
            {
              icon: 'FileEditLine',
              effect: SelectorColorEffect,
              tooltip: 'Edit code',
              size: 'tiny',
              show: !!data?.code && isLocalInterface ? 'hover' : false,
            },
            {
              icon: 'DeleteBinLine',
              effect: NegativeColorEffect,
              tooltip: 'Delete',
              size: 'tiny',
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
                } else if (isServerInterface) {
                  confirmAction({
                    title: 'Delete server interface',
                    description:
                      'Are you sure you want to delete this interface FROM THE ACTIVE INSTANCE?',
                    onConfirm: () => {
                      onDeleteRemoteClick(name || data.id);
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
        })
      )}
    />
  );
};
