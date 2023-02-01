import { ReqorePanel, ReqoreTree, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { ITypeComparatorData } from '../../helpers/functions';
import { useGetInputOutputType } from '../../hooks/useGetInputOutputType';
import Loader from '../Loader';

export interface IInputOutputTypeProps {
  inputProvider?: ITypeComparatorData;
  outputProvider?: ITypeComparatorData;
  compact?: boolean;
}

export const InputOutputType = ({
  inputProvider,
  outputProvider,
  compact,
}: IInputOutputTypeProps) => {
  const { inputType, outputType } = useGetInputOutputType(inputProvider, outputProvider);

  if (compact) {
    return (
      <>
        <ReqoreVerticalSpacer height={10} />
        <ReqorePanel
          label="Input type"
          badge={
            size(inputType)
              ? [inputType.name, { labelKey: 'Fields', label: size(inputType.fields) }]
              : undefined
          }
          size="small"
        >
          {inputType ? !size(inputType) ? 'No input type' : inputType.desc : <Loader size={10} />}
        </ReqorePanel>
        <ReqoreVerticalSpacer height={5} />
        <ReqorePanel
          label="Output type"
          badge={
            size(outputType)
              ? [outputType.name, { labelKey: 'Fields', label: size(outputType.fields) }]
              : undefined
          }
          size="small"
        >
          {outputType ? (
            !size(outputType) ? (
              'No output type'
            ) : (
              outputType.desc
            )
          ) : (
            <Loader size={10} />
          )}
        </ReqorePanel>
      </>
    );
  }

  return (
    <>
      <ReqorePanel
        label="Input type"
        style={{ flex: '1 0' }}
        badge={
          size(inputType)
            ? [inputType.name, { labelKey: 'Fields', label: size(inputType.fields) }]
            : undefined
        }
      >
        {inputType ? <ReqoreTree data={inputType} size="small" /> : <Loader />}
      </ReqorePanel>
      <ReqoreVerticalSpacer height={10} />
      <ReqorePanel
        label="Output type"
        style={{ flex: '1 0' }}
        badge={
          size(outputType)
            ? [outputType.name, { labelKey: 'Fields', label: size(outputType.fields) }]
            : undefined
        }
      >
        {outputType ? <ReqoreTree data={outputType} size="small" /> : <Loader />}
      </ReqorePanel>
    </>
  );
};
