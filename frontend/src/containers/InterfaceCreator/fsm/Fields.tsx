import { ReqoreSpinner } from '@qoretechnologies/reqore';
import { useAsyncRetry } from 'react-use';
import Options, {
  IOptionsSchema,
  TFlatOptions,
  flattenOptions,
} from '../../../components/Field/systemOptions';
import { callBackendBasic } from '../../../helpers/functions';

let fields: IOptionsSchema;

export interface IQodexFieldsProps {
  value?: TFlatOptions;
  onChange?: (value: TFlatOptions) => void;
}

export const QodexFields = ({ value, onChange }: IQodexFieldsProps) => {
  const { loading } = useAsyncRetry(async () => {
    if (!fields) {
      const data = await callBackendBasic(
        'creator-get-fields-as-options',
        undefined,
        { iface_kind: 'fsm' },
        undefined,
        undefined,
        true
      );

      fields = data.data.fields;
    }

    return fields;
  });

  if (loading) {
    return <ReqoreSpinner> Loading </ReqoreSpinner>;
  }

  return (
    <Options
      name="fsm-fields"
      options={fields}
      value={value}
      onChange={(_name, metadata) => {
        onChange(flattenOptions(metadata));
      }}
    />
  );
};
