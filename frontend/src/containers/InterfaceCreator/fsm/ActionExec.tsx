import { ReqoreButton, ReqoreControlGroup, ReqoreModal } from '@qoretechnologies/reqore';
import { useState } from 'react';
import { PositiveColorEffect, SaveColorEffect } from '../../../components/Field/multiPair';
import Options, { IOptions, IOptionsSchema } from '../../../components/Field/systemOptions';
import { fetchData } from '../../../helpers/functions';
import { useGetAppActionData } from '../../../hooks/useGetAppActionData';
import { QodexAppActionOptions } from './AppActionOptions';

export interface IQodexActionExecProps {
  appName: string;
  actionName: string;
  options?: IOptions;
}

export const QodexActionExec = ({ appName, actionName, options }: IQodexActionExecProps) => {
  const { app, action } = useGetAppActionData(appName, actionName);
  const [defaultOptions, setDefaultOptions] = useState<IOptions>(options);
  const [execOptions, setExecOptions] = useState<IOptionsSchema>(undefined);
  const [execOptionsValue, setExecOptionsValue] = useState<IOptions>(undefined);

  const handleClick = async () => {
    const optionsUrl = action.exec_options_url.split('latest/')[1];

    const response = await fetchData(`${optionsUrl}?context=ui`, 'PUT', {
      options,
    });

    console.log(response);

    if (response.ok) {
      setExecOptions(response.data);
    }
  };

  const handleSubmitClick = async () => {
    const optionsUrl = action.exec_url.split('latest/')[1];

    const response = await fetchData(`${optionsUrl}?context=ui`, 'POST', {
      options: {
        ...defaultOptions,
        ...execOptionsValue,
      },
    });

    console.log(response);
  };

  console.log(execOptionsValue);

  return (
    <>
      {execOptions && (
        <ReqoreModal
          isOpen
          label={`Test action: ${action.display_name}`}
          bottomActions={[
            {
              label: 'Test',
              effect: SaveColorEffect,
              onClick: handleSubmitClick,
            },
          ]}
        >
          <QodexAppActionOptions
            value={defaultOptions}
            onChange={(_name, value) => setDefaultOptions(value)}
            appName={appName}
            actionName={actionName}
          />
          <Options
            flat
            zoomable
            label={undefined}
            badge={undefined}
            allowTemplates={false}
            options={execOptions}
            value={execOptionsValue}
            onChange={(_name, value) => {
              setExecOptionsValue((cur) => ({ ...cur, ...value }));
            }}
            name="options"
          />
        </ReqoreModal>
      )}
      <ReqoreControlGroup fluid>
        <ReqoreButton
          label="Test action"
          textAlign="center"
          effect={PositiveColorEffect}
          icon="PlayLine"
          rightIcon="PlayLine"
          onClick={handleClick}
        />
      </ReqoreControlGroup>
    </>
  );
};
