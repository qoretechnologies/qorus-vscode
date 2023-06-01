import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreMessage,
  ReqoreRadioGroup,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { map } from 'lodash';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { IField } from '../../components/FieldWrapper';
import { TextContext } from '../../context/text';
import { fetchData, insertUrlPartBeforeQuery } from '../../helpers/functions';
import { validateField } from '../../helpers/validations';
import { useFetchAutoVarContext } from '../../hooks/useFetchAutoVarContext';
import Loader from '../Loader';
import Connectors, { IProviderType, getUrlFromProvider } from './connectors';
import MethodSelector from './methodSelector';
import Select from './select';

export interface IServiceEventHandler {
  type: 'fsm' | 'method';
  value: string;
}
export interface IServiceEventHandlers {
  [key: string]: IServiceEventHandler;
}
export interface IServiceEvent extends IProviderType {
  handlers?: IServiceEventHandlers;
}

export type IServiceEventList = IServiceEvent[];

export interface IServiceEventListFieldProps extends IField {
  value: IServiceEventList;
  onChange: (name: string, value: IServiceEventList) => void;
}

export interface IServiceEventListHandlers {
  eventProvider: IProviderType;
  value: IServiceEventHandlers;
  onChange: (value: IServiceEventHandlers) => void;
}

export const ServiceEventListHandlers: React.FC<IServiceEventListHandlers & Partial<IField>> = ({
  eventProvider,
  value,
  onChange,
  requestFieldData,
}) => {
  const eventsData = useAsyncRetry(async () => {
    const data = await fetchData(
      `${insertUrlPartBeforeQuery(getUrlFromProvider(eventProvider), '/events')}`
    );

    if (data.error) {
      console.error(data.error);
    }

    return data.data;
  }, []);

  const autoVars = useFetchAutoVarContext(eventProvider);

  if (eventsData.loading || autoVars.loading) {
    return <Loader />;
  }

  const handleAddNewEvent = (_name, eventName) => {
    onChange({
      ...value,
      [eventName]: {
        type: null,
        value: null,
      },
    });
  };

  const handleEventHandlerRemove = (eventName) => {
    const newHandlers = { ...value };

    delete newHandlers[eventName];

    onChange(newHandlers);
  };

  const availableEvents = map(eventsData.value, (eventData, eventName) => ({
    ...eventData,
    name: eventName,
  })).filter((eventData) => {
    return !value?.[eventData.name];
  });

  return (
    <>
      <ReqoreCollection
        minColumnWidth="200px"
        label="Event handlers"
        emptyMessage="No event handlers. Click button below to add new event handler."
        headerSize={4}
        filterable
        flat={false}
        minimal
        sortable
        items={map(
          value,
          (handler, eventName): IReqoreCollectionItemProps => ({
            label: eventName,
            intent: handler.type && handler.value ? undefined : 'danger',
            className: 'service-event-handler',
            actions: [
              {
                icon: 'DeleteBin4Line',
                onClick: () => handleEventHandlerRemove(eventName),
                intent: 'danger',
                className: 'service-event-handler-remove',
              },
            ],
            content: (
              <>
                <ReqoreRadioGroup
                  vertical={false}
                  margin="none"
                  selected={handler.type}
                  onSelectClick={(type: 'fsm' | 'method') => {
                    onChange({
                      ...value,
                      [eventName]: {
                        ...handler,
                        value: undefined,
                        type,
                      },
                    });
                  }}
                  items={[
                    { label: 'Method', value: 'method', margin: 'right' },
                    { label: 'FSM', value: 'fsm', margin: 'right' },
                  ]}
                />
                {handler.type === 'method' && (
                  <>
                    <ReqoreVerticalSpacer height={10} />
                    <MethodSelector
                      value={handler.value}
                      name="method"
                      onChange={(_name, method) => {
                        onChange({
                          ...value,
                          [eventName]: {
                            ...handler,
                            value: method,
                          },
                        });
                      }}
                    />
                  </>
                )}
                {handler.type === 'fsm' && (
                  <>
                    <ReqoreVerticalSpacer height={10} />
                    <Select
                      onChange={(_name, fsmName) =>
                        onChange({
                          ...value,
                          [eventName]: {
                            ...handler,
                            value: fsmName,
                          },
                        })
                      }
                      requestFieldData={requestFieldData}
                      name="fsm"
                      value={handler.value}
                      get_message={{
                        action: 'creator-get-objects',
                        object_type: 'fsm',
                      }}
                      return_message={{
                        action: 'creator-return-objects',
                        object_type: 'fsm',
                        return_value: 'objects',
                      }}
                      reference={{
                        iface_kind: 'fsm',
                        context: {
                          autovar: autoVars.value,
                          target_dir: requestFieldData?.('target_dir', 'value'),
                        },
                      }}
                    />
                  </>
                )}
              </>
            ),
          })
        )}
      ></ReqoreCollection>
      <ReqoreVerticalSpacer height={10} />
      {size(availableEvents) !== 0 ? (
        <Select
          defaultItems={availableEvents}
          onChange={handleAddNewEvent}
          placeholder="Select from available events"
          className="service-event-select"
        />
      ) : null}
    </>
  );
};

export const ServiceEventListField: React.FC<IServiceEventListFieldProps> = ({
  value,
  name,
  onChange,
  requestFieldData,
}) => {
  const t = useContext(TextContext);
  const [data, setData] = useState<IServiceEventList>(
    value || [
      {
        name: undefined,
        type: undefined,
        handlers: {},
      },
    ]
  );

  const handleEventRemove = (index: number): void => {
    setData((cur) => {
      let result = [...cur];

      result = result.filter((_trig, idx) => idx !== index);

      return result;
    });
  };

  useEffect(() => {
    onChange?.(name, data);
  }, [data]);

  const updateEventProvider = (index: number, value: IProviderType): void => {
    setData((cur) => {
      const result = [...cur];

      result[index] = value;

      return result;
    });
  };

  const updateEventHandlers = (index: number, value: IServiceEventHandlers): void => {
    setData((cur) => {
      const result = [...cur];

      result[index].handlers = value;

      return result;
    });
  };

  return (
    <>
      <ReqoreMessage intent="info">
        Service events are not related to workflow synchronization events
      </ReqoreMessage>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreCollection
        sortable
        minColumnWidth="550px"
        filterable
        flat={false}
        items={data.map(
          (datum, index): IReqoreCollectionItemProps => ({
            label: `Item ${index + 1}`,
            customTheme: { main: 'main:darken:1' },
            intent: validateField('service-event', datum) ? undefined : 'danger',
            className: 'service-event',
            actions: [
              {
                icon: 'DeleteBin4Line',
                show: size(data) > 1,
                onClick: () => handleEventRemove(index),
                intent: 'danger',
                className: 'service-event-remove',
              },
            ],
            content: (
              <>
                <Connectors
                  isEvent
                  onChange={(_name, value) => updateEventProvider(index, value)}
                  value={datum}
                />
                {validateField('data-provider', datum) && (
                  <>
                    <ServiceEventListHandlers
                      eventProvider={datum}
                      value={datum.handlers}
                      onChange={(value) => updateEventHandlers(index, value)}
                      requestFieldData={requestFieldData}
                    />
                  </>
                )}
              </>
            ),
          })
        )}
      />
      <ReqoreVerticalSpacer height={10} />
      <ReqoreButton
        onClick={() =>
          setData((cur) => [...cur, { name: undefined, type: undefined, handlers: {} }])
        }
        fluid
        rightIcon="AddLine"
        intent="info"
        icon="AddLine"
        className="service-event-add-new"
      >
        {t('AddNew')}
      </ReqoreButton>
    </>
  );
};
