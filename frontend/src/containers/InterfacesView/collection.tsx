import { ReqoreCollection, ReqoreTag, useReqoreProperty } from '@qoretechnologies/reqore';
import { TReqoreBadge } from '@qoretechnologies/reqore/dist/components/Button';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { IReqoreTagProps } from '@qoretechnologies/reqore/dist/components/Tag';
import { capitalize, size } from 'lodash';
import { useContext, useMemo } from 'react';
import {
  NegativeColorEffect,
  PositiveColorEffect,
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
  zoom: number;
}

let showAsTable = false;

export const InterfacesViewCollection = ({ type, zoom }: IInterfaceViewCollectionProps) => {
  const addNotification = useReqoreProperty('addNotification');
  const confirmAction = useReqoreProperty('confirmAction');
  const { changeDraft, changeTab, qorus_instance, is_hosted_instance } = useContext(InitialContext);

  const { value, loading, onDeleteRemoteClick, retry } = useFetchInterfaces(type);

  const onDeleteClick = async (type, id?) => {
    await deleteDraft(interfaceKindTransform[type], id, true, addNotification);

    retry();
  };

  const getRemotesCount = () => {
    return size(value);
  };

  const getDraftsCount = () => {
    return size(value.filter((item) => item.draft || item.hasDraft));
  };

  const badges = useMemo(() => {
    const badgeList: TReqoreBadge[] = [getRemotesCount()];

    badgeList.push({ label: getDraftsCount(), intent: 'pending' });

    return badgeList;
  }, [getDraftsCount, getRemotesCount, qorus_instance]);

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
      actions={[
        {
          icon: 'AddCircleLine',
          tooltip: `Create new ${type}`,
          label: 'Create new',
          minimal: true,
          flat: false,
          onClick: () => changeTab('CreateInterface', type),
          effect: PositiveColorEffect,
        },
        {
          icon: 'CloseLine',
          tooltip: `Delete ${type} drafts`,
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
      items={value.map(
        ({ label, data, draft, hasDraft, ...rest }): IReqoreCollectionItemProps => ({
          label: label || data?.display_name,
          icon: interfaceIcons[type],
          content: <InterfacesViewItem data={data} />,
          contentEffect: {
            gradient: {
              direction: 'to right bottom',
              colors: {
                50: 'main',
                300: draft && !data ? 'success' : draft ? 'pending' : 'main:lighten',
              },
            },
          },
          flat: true,
          showHeaderTooltip: true,
          responsiveTitle: false,
          responsiveActions: false,
          size: zoomToSize[zoom],
          onClick: () => {
            if (draft) {
              changeDraft({
                type,
                id: rest.id,
              });
            } else {
              postMessage(
                Messages.GET_INTERFACE_DATA,
                {
                  iface_kind: type,
                  name: data?.name,
                  include_tabs: true,
                },
                true
              );
            }
          },
          actions: [
            {
              as: ReqoreTag,
              show: draft ? true : false,
              props: {
                icon: 'EditLine',
                label: draft && !data ? 'New' : 'Draft',
                intent: draft && !data ? 'success' : 'pending',
                size: 'tiny',
              } as IReqoreTagProps,
            },
            {
              icon: 'CloseLine',
              effect: WarningColorEffect,
              tooltip: 'Delete draft',
              size: 'tiny',
              show: draft ? 'hover' : false,
              onClick: () => {
                confirmAction({
                  title: 'Delete draft',
                  description: 'Are you sure you want to delete this draft?',
                  onConfirm: () => {
                    onDeleteClick(type, rest.id);
                  },
                });
              },
            },
            {
              icon: 'DeleteBinLine',
              effect: NegativeColorEffect,
              tooltip: 'Delete',
              size: 'tiny',
              show: !draft || data ? 'hover' : false,
              onClick: () => {
                confirmAction({
                  title: 'Delete server interface',
                  description:
                    'Are you sure you want to delete this interface FROM THE ACTIVE INSTANCE?',
                  onConfirm: () => {
                    onDeleteRemoteClick(label || data.id);
                  },
                });
              },
            },
          ],
        })
      )}
    />
  );
};
