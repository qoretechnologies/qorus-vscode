import { ReqoreColumn, ReqoreColumns, ReqoreMessage } from '@qoretechnologies/reqore';
import React, { useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { InitialContext } from '../../context/init';
import withTextContext from '../../hocomponents/withTextContext';
import ConnectorField from './connectors';

export type TProcessorArgs = { [arg: string]: string };
export type TProcessorArgsList = { id: number; prefix: string; name: string }[];
export type TTypeProvider = { path: string; name: string; type: string };

export interface IProcessorField extends IField {
  value: {
    'processor-input-type': TTypeProvider;
    'processor-output-type': TTypeProvider;
  };
}

const ProcessorField: React.FC<IFieldChange & IProcessorField> = ({ name, value, onChange, t }) => {
  const initialData = useContext(InitialContext);
  const [inputType, setInputType] = useState<TTypeProvider>(value?.['processor-input-type']);
  const [outputType, setOutputType] = useState<TTypeProvider>(value?.['processor-output-type']);

  useMount(() => {
    if (!value) {
      onChange(name, {
        'processor-input-type': undefined,
        'processor-output-type': undefined,
      });
    }
  });

  useUpdateEffect(() => {
    onChange(name, {
      'processor-input-type': inputType,
      'processor-output-type': outputType,
    });
  }, [inputType, outputType]);

  return (
    <>
      {!initialData?.qorus_instance ? (
        <ReqoreMessage intent="warning">{t('ActiveInstanceRequired')}</ReqoreMessage>
      ) : (
        <ReqoreColumns columnsGap="10px">
          <ReqoreColumn>
            <ConnectorField
              title={t('InputType')}
              inline
              value={inputType}
              isInitialEditing={!!initialData.class}
              name={name}
              providerType="inputs"
              onChange={(_name, value) => setInputType(value)}
            />
          </ReqoreColumn>
          <ReqoreColumn>
            <ConnectorField
              title={t('OutputType')}
              inline
              value={outputType}
              isInitialEditing={!!initialData.class}
              name={name}
              providerType="outputs"
              onChange={(_name, value) => setOutputType(value)}
            />
          </ReqoreColumn>
        </ReqoreColumns>
      )}
    </>
  );
};

export default withTextContext()(ProcessorField);
