import { ReqorePanel, ReqoreSpinner } from '@qoretechnologies/reqore';
import { IReqoreDropdownProps } from '@qoretechnologies/reqore/dist/components/Dropdown';
import { IReqoreTextareaProps } from '@qoretechnologies/reqore/dist/components/Textarea';
import { map, reduce, size } from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { TFSMStateAction } from '.';
import { IApp, IAppAction } from '../../../components/AppCatalogue';
import Options, { IOptions, IOptionsSchema } from '../../../components/Field/systemOptions';
import { getAppAndAction } from '../../../helpers/fsm';
import { fetchData } from '../../../helpers/functions';
import { useFetchActionOptions } from '../../../hooks/useFetchActionOptions';
import { useGetAppActionData } from '../../../hooks/useGetAppActionData';
import { useWhyDidYouUpdate } from '../../../hooks/useWhyDidYouUpdate';

export interface IQodexAppActionOptionsProps {
  appName: string;
  actionName: string;
  value: IOptions;
  onChange: (name: string, value: IOptions) => void;
  connectedStates?: TQodexStatesForTemplates;
}

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
  }: IQodexAppActionOptionsProps) => {
    const apps = useGetAppActionData();
    const { action } = useGetAppActionData(appName, actionName);
    const [options, setOptions] = useState<IOptionsSchema>({
      ...action.options,
      ...(action.convenience_options || {}),
      ...(action.advanced_options || {}),
    });
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
    const [templates, setTemplates] = useState<IReqoreTextareaProps['templates']>();
    const [value, setValue] = useState<IOptions>(outsideValue);

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

    useEffect(() => {
      setValue(outsideValue);
    }, [JSON.stringify(outsideValue)]);

    const buildTemplates = useCallback(
      (
        items: {
          [stateId: number]: { display_name: string; value: string; example_value?: string }[];
        } = {}
      ) => {
        if (!size(connectedStates)) {
          return undefined;
        }

        return {
          useTargetWidth: true,
          noArrow: true,
          items: [
            {
              divider: true,
              label: 'Use data from connected apps',
              size: 'small',
              textAlign: 'left',
              dividerAlign: 'left',
            },
            ...map(connectedStates, ({ value, isValid }, stateId) => {
              const { app, action } = getAppAndAction(apps, value.app, value.action);

              return {
                disabled: isValid === false,
                intent: isValid === false ? 'danger' : undefined,
                label: action.display_name,
                description: action.short_desc,
                leftIconProps: {
                  image: app.logo,
                },
                items: map(items[stateId], ({ display_name, value }) => ({
                  label: display_name,
                  value,
                })),
              };
            }),
          ],
        } as IReqoreDropdownProps;
      },
      [connectedStates]
    );

    const { load, loading } = useFetchActionOptions({
      loadOnMount: true,
      action,
      options: value,
      onSuccess: (options) => {
        setOptions(options);
      },
    });

    const fetchTemplates = useCallback(async () => {
      setLoadingTemplates(true);

      // Set the initial templates
      setTemplates(buildTemplates());

      // Get everything after "latest/" in action.options_url
      const response = await fetchData(
        `fsms/getStateData?context=ui`,
        'PUT',
        reduce(
          connectedStates,
          (newStates, { type, value }, stateId) => ({
            ...newStates,
            [stateId]: {
              type,
              value,
            },
          }),
          {}
        )
      );

      if (response.ok) {
        setLoadingTemplates(false);

        const data: {
          [stateId: number]: { display_name: string; value: string; example_value?: string }[];
        } = response.data;

        setTemplates(buildTemplates(data));
      }
    }, [connectedStates]);

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
                  'https://hq.qoretechnologies.com:8092/api/public/apps/QorusApiObjects/qorus-builtin-api.svg',
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
          label={undefined}
          badge={undefined}
          allowTemplates={false}
          key={JSON.stringify(options)}
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
