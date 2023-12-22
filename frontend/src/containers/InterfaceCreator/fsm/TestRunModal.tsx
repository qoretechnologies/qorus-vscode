import {
  ReqoreCollection,
  ReqoreMessage,
  ReqoreSpinner,
  ReqoreTree,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { map, size } from 'lodash';
import { useAsyncRetry } from 'react-use';
import { IFSMMetadata, IFSMStates } from '.';
import { IApp } from '../../../components/AppCatalogue';
import { getAppAndAction } from '../../../helpers/fsm';
import { fetchData } from '../../../helpers/functions';

export interface IQodexTestRunModalProps {
  data: IFSMMetadata & { states: IFSMStates };
  apps: IApp[];
}

export const QodexTestRunModal = ({ data, apps }: IQodexTestRunModalProps) => {
  const { loading, value, error } = useAsyncRetry(async () => {
    const testResponse = await fetchData('/fsms/exec?state_data=true', 'POST', {
      fsm: {
        type: 'fsm',
        ...data,
      },
    });

    if (testResponse.ok) {
      return testResponse.data.state_data;
    }
  }, [data]);

  if (loading) {
    return (
      <ReqoreSpinner type={5} iconColor="info:lighten" centered>
        {' '}
        Loading ...{' '}
      </ReqoreSpinner>
    );
  }

  if (error) {
    return (
      <ReqoreMessage opaque={false} intent="danger">
        {' '}
        {error}{' '}
      </ReqoreMessage>
    );
  }

  if (!size(data)) {
    return (
      <ReqoreMessage opaque={false} intent="warning">
        {' '}
        No data{' '}
      </ReqoreMessage>
    );
  }

  const responseList = Object.keys(value)
    .sort((a, b) => {
      const aSort = value[a]?.sort || 0;
      const bSort = value[b]?.sort || 0;

      return bSort - aSort;
    })
    .map((key) => ({ ...value[key], key }));

  return (
    <ReqoreCollection
      sortable={false}
      showAs="list"
      filterable
      padded={false}
      zoomable
      fill
      defaultZoom={0.5}
      items={map(responseList, ({ success, key, response }, index): IReqoreCollectionItemProps => {
        const { app } = getAppAndAction(
          apps,
          data.states[key].action.value.app,
          data.states[key].action.value.action
        );

        return {
          label: `[${size(responseList) - index}] ${data.states[key].name}`,
          intent: success ? 'success' : 'danger',
          content:
            typeof response === 'string' || typeof response === 'number' ? (
              response
            ) : (
              <ReqoreTree data={response} />
            ),
          // @ts-expect-error
          collapsible: true,
          isCollapsed: index > 0,
          iconImage: app?.logo,
          iconProps: {
            size: '25px',
          },
          badge: [
            {
              icon: success ? 'CheckLine' : 'CloseLine',
              color: success ? 'success:lighten' : 'danger:lighten',
            },
            app?.display_name,
          ],
        };
      })}
    />
  );
};
