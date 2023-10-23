import { useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import Options, { IOptions, IOptionsSchema } from '../../../components/Field/systemOptions';
import { fetchData } from '../../../helpers/functions';
import { useGetAppActionData } from '../../../hooks/useGetAppActionData';

export interface IQodexAppActionOptionsProps {
  appName: string;
  actionName: string;
  value: IOptions;
  onChange: (name: string, value: IOptions) => void;
}

export const QodexAppActionOptions = ({
  appName,
  actionName,
  value,
  onChange,
}: IQodexAppActionOptionsProps) => {
  const { app, action } = useGetAppActionData(appName, actionName);
  const [options, setOptions] = useState<IOptionsSchema>(action.options);

  const apiOptions = useAsyncRetry(async () => {
    // Get everything after "latest/" in action.options_url
    const optionsUrl = action.options_url.split('latest/')[1];
    const response = await fetchData(`${optionsUrl}?context=ui`, 'PUT', {
      options: value,
    });

    return response.data?.options;
  }, [value]);

  useEffect(() => {
    setOptions(apiOptions.value);
  }, [apiOptions.value]);

  return (
    <Options
      flat
      zoomable
      label={undefined}
      badge={undefined}
      allowTemplates={false}
      key={JSON.stringify(options)}
      options={options}
      value={value}
      onChange={onChange}
      name="options"
    />
  );
};
