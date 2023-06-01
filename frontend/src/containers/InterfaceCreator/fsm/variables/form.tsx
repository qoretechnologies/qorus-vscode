import { ReqorePanel, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { isEqual } from 'lodash';
import { useCallback, useState } from 'react';
import { IFSMVariable } from '..';
import Field from '../../../../components/Field';
import Auto from '../../../../components/Field/auto';
import { PositiveColorEffect } from '../../../../components/Field/multiPair';
import Select from '../../../../components/Field/select';
import { FieldWrapper } from '../../../../components/FieldWrapper';
import { validateField } from '../../../../helpers/validations';

export interface IVariableFormProps extends IFSMVariable {
  onChange: (originalVariableName: string, data: Partial<IFSMVariable>) => void;
  isVariableValid: (data: Partial<IFSMVariable>) => boolean;
  variableNames?: string[];
}

export const VariableForm = ({
  name,
  value,
  type,
  desc,
  variableType,
  readOnly,
  onChange,
  isVariableValid,
  variableNames,
}: IVariableFormProps) => {
  const [data, setData] = useState<Partial<IFSMVariable>>({
    name,
    value,
    type,
    desc,
    variableType,
    readOnly,
  });

  const handleDataChange = useCallback(
    (name: string, value: any) => {
      setData((prev) => ({ ...prev, [name]: value }));
    },
    [data]
  );

  const isNameValid = (name: string): boolean => {
    return validateField('string', name) && (!variableNames || !variableNames.includes(name));
  };

  const isValid = () => {
    return (
      !isEqual(data, { name, value, type, desc }) && isVariableValid(data) && isNameValid(data.name)
    );
  };

  return (
    <ReqorePanel
      fluid
      fill
      flat
      padded={false}
      minimal
      transparent
      bottomActions={[
        {
          label: 'Reset changes',
          icon: 'HistoryLine',
          onClick: () => setData({ name, value, type, desc, variableType }),
          position: 'left',
          id: 'reset-variable',
          show: !data?.readOnly,
        },
        {
          label: 'Save variable',
          icon: 'CheckLine',
          effect: PositiveColorEffect,
          onClick: () => onChange?.(name, data),
          disabled: !isValid(),
          position: 'right',
          id: 'save-variable',
          show: !data?.readOnly,
        },
      ]}
    >
      <FieldWrapper
        label="Name"
        desc="The name of the variable"
        compact
        isValid={isNameValid(data.name)}
      >
        <Field
          type="string"
          value={data?.name}
          name="name"
          onChange={handleDataChange}
          disabled={data?.readOnly}
        />
      </FieldWrapper>
      <ReqoreVerticalSpacer height={10} />
      <FieldWrapper label="Description" desc="The description of the variable" compact isValid>
        <Field
          type="long-string"
          value={data?.desc}
          markdown
          name="desc"
          onChange={handleDataChange}
          disabled={data?.readOnly}
        />
      </FieldWrapper>
      <ReqoreVerticalSpacer height={10} />
      <FieldWrapper
        label="Type"
        desc="The type of the variable"
        compact
        isValid={validateField('string', data.type)}
      >
        <Select
          disabled={data?.readOnly}
          defaultItems={[
            { name: 'data-provider' },
            { name: 'bool' },
            { name: 'date' },
            { name: 'string' },
            { name: 'binary' },
            { name: 'float' },
            { name: 'list' },
            { name: 'hash' },
            { name: 'int' },
          ]}
          value={data?.type}
          name="type"
          onChange={(name, value) => {
            handleDataChange('value', undefined);
            handleDataChange(name, value);
          }}
        />
      </FieldWrapper>
      <ReqoreVerticalSpacer height={10} />
      <FieldWrapper
        label="Value"
        desc="The value of the variable"
        compact
        isValid={validateField(data.type, data.value, { isVariable: true })}
      >
        <Auto
          defaultType={data.type}
          defaultInternalType={data.type}
          value={data?.value}
          name="value"
          onChange={handleDataChange}
          key={data.type}
          isConfigItem={false}
          isVariable
          disabled={data?.readOnly}
          disableSearchOptions={data?.readOnly}
        />
      </FieldWrapper>
    </ReqorePanel>
  );
};
