import { ReqorePanel, ReqoreSpinner } from '@qoretechnologies/reqore';
import { IReqoreTextareaProps } from '@qoretechnologies/reqore/dist/components/Textarea';
import { size } from 'lodash';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useDebounce, useMount, useUpdateEffect } from 'react-use';
import { FSMContext, IFSMStates, TFSMStateAction } from '.';
import { IApp, IAppAction } from '../../../components/AppCatalogue';
import Options, {
  IOptions,
  IOptionsSchema,
  IQorusType,
} from '../../../components/Field/systemOptions';
import { prepareFSMDataForPublishing } from '../../../helpers/fsm';
import { buildTemplates, fetchData } from '../../../helpers/functions';
import { addMessageListener, postMessage } from '../../../hocomponents/withMessageHandler';
import { useFetchActionOptions } from '../../../hooks/useFetchActionOptions';
import { useGetAppActionData } from '../../../hooks/useGetAppActionData';
import { useWhyDidYouUpdate } from '../../../hooks/useWhyDidYouUpdate';

export interface IQodexAppActionOptionsProps {
  appName: string;
  actionName: string;
  value: IOptions;
  onChange: (name: string, value: IOptions) => void;
  connectedStates?: TQodexStatesForTemplates;
  fullConnectedStates?: IFSMStates;
  id?: string;
}

export interface IQodexTemplate {
  app: string;
  action: string;
  display_name: string;
  short_desc: string;
  logo: string;
  internal?: boolean;
  items: {
    name: string;
    display_name: string;
    short_desc: string;
    desc: string;
    example_value: any;
    value: string;
    type: IQorusType;
  }[];
}

export type TQodexTemplates = Record<string | number, IQodexTemplate>;

export interface IQodexStateDataForTemplates extends TFSMStateAction {
  isValid?: boolean;
  app?: IApp;
  action?: IAppAction;
}

export type TQodexStatesForTemplates = Record<string | number, IQodexStateDataForTemplates>;

export const QodexAppActionOptions = memo(
  ({
    appName,
    actionName,
    value: outsideValue,
    onChange,
    connectedStates,
    id,
  }: IQodexAppActionOptionsProps) => {
    const { action } = useGetAppActionData(appName, actionName);
    const [options, setOptions] = useState<IOptionsSchema>(action?.options);
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
    const [templates, setTemplates] = useState<IReqoreTextareaProps['templates']>();
    const [value, setValue] = useState<IOptions>(outsideValue);
    const { metadata, states } = useContext(FSMContext);

    useWhyDidYouUpdate(`AppActionOptions`, {
      appName,
      actionName,
      value,
      onChange,
      connectedStates,
    });

    useDebounce(
      () => {
        onChange('options', value);
      },
      300,
      [value]
    );

    useUpdateEffect(() => {
      setValue(outsideValue);
    }, [JSON.stringify(outsideValue)]);

    useMount(() => {
      postMessage('subscribe', { args: { matchEvent: 'CONNECTION_UPDATED' } }, true);
      addMessageListener(
        'SUBSCRIPTION-EVENT',
        (data) => {
          if (data?.data?.event_id === 'CONNECTION_UPDATED') {
            load();
          }
        },
        true
      );
    });

    const { load, loading } = useFetchActionOptions({
      loadOnMount: true,
      action,
      options: value,
      onSuccess: (options) => {
        setOptions(options);
      },
    });

    const fetchTemplates = useCallback(async () => {
      if (!size(connectedStates)) {
        return;
      }

      setLoadingTemplates(true);

      // Set the initial templates
      setTemplates(buildTemplates());

      // Get everything after "latest/" in action.options_url
      // TODO: Param FSM with the whole FSM
      // fsm_context: workflow | service | job
      //
      const response = await fetchData(`fsms/getStateData?context=ui`, 'PUT', {
        fsm: prepareFSMDataForPublishing(metadata, states),
        current_state: id,
      });

      if (response.ok) {
        setLoadingTemplates(false);

        const data = response.data;

        setTemplates(buildTemplates(data, states, 'Use data from connected actions'));
      }
    }, [JSON.stringify(connectedStates)]);

    const handleDependableOptionChange = useCallback((name, value, options) => {
      load({
        ...options,
        [name]: {
          ...options[name],
          value,
        },
      });
    }, []);

    useEffect(() => {
      fetchTemplates();
    }, [JSON.stringify(connectedStates)]);

    return (
      <>
        {loading && (
          <ReqorePanel
            flat
            opacity={0.8}
            blur={3}
            style={{
              position: 'absolute',
              zIndex: 1,
              width: '100%',
              height: '100%',
            }}
            contentStyle={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <ReqoreSpinner
              iconColor="info"
              type={3}
              centered
              size="big"
              iconProps={{
                image:
                  'https://hq.qoretechnologies.com:8092/api/public/apps/QorusBuiltinApi/qorus-builtin-api.svg',
              }}
              labelEffect={{
                uppercase: true,
                spaced: 4,
                textSize: 'small',
                weight: 'bold',
              }}
            >
              Re-loading options...
            </ReqoreSpinner>
          </ReqorePanel>
        )}
        <Options
          flat
          zoomable
          padded={false}
          label={undefined}
          badge={undefined}
          options={options}
          value={value}
          onDependableOptionChange={handleDependableOptionChange}
          onChange={(_name, options) => setValue(options)}
          name="options"
          sortable={false}
          stringTemplates={templates}
        />
      </>
    );
  }
);
