import { ReqoreControlGroup, ReqoreTag, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { useMemo } from 'react';
import { hasAllDependenciesFullfilled, validateField } from '../../helpers/validations';
import { IOptions, IOptionsSchema, TOption, getType } from './systemOptions';

export interface IOptionFieldMessagesProps {
  schema: IOptionsSchema;
  option: TOption;
  allOptions?: IOptions;
  name: string;
}

export const OptionFieldMessages = ({
  schema,
  option,
  name,
  allOptions,
}: IOptionFieldMessagesProps) => {
  const optionSchema = useMemo(() => schema[name], [schema, option]);
  const messages: string[] = useMemo(() => {
    const result: string[] = [];

    if (
      option.value ||
      option.value === false ||
      option.value === 0 ||
      option.value === '' ||
      option.value === null
    ) {
      if (
        !validateField(getType(option.type), option.value, {
          has_to_have_value: true,
          ...schema,
        })
      ) {
        result.push('Field value is not valid');
      }
    } else {
      if (optionSchema.required) {
        result.push('This field is required');
      }
    }

    if (!hasAllDependenciesFullfilled(optionSchema.depends_on, allOptions, schema)) {
      result.push('Some dependencies are not fullfilled');
    }

    return result;
  }, [schema, option, allOptions, optionSchema]);

  if (!size(messages)) {
    return null;
  }

  return (
    <>
      <ReqoreVerticalSpacer height={5} />
      <ReqoreControlGroup size="small" wrap>
        {messages.map((message, index) => (
          <ReqoreTag minimal icon="ErrorWarningLine" key={index} intent="danger" label={message} />
        ))}
      </ReqoreControlGroup>
    </>
  );
};
