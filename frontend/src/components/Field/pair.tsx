import { ReqoreButton, ReqoreControlGroup, ReqoreTag } from '@qoretechnologies/reqore';
import { FunctionComponent, useContext } from 'react';
import { IFieldChange } from '../../components/FieldWrapper';
import { InitialContext } from '../../context/init';
import StringField from './string';

export interface IPairField {
  keyName: string;
  valueName: string;
  keyValue: string;
  valueValue: string;
  index: number | string;
  onRemoveClick: () => void;
  canBeRemoved: boolean;
}

const PairField: FunctionComponent<IPairField & IFieldChange> = ({
  keyName,
  valueName,
  keyValue,
  valueValue,
  onChange,
  index,
  onRemoveClick,
  canBeRemoved,
  t,
}) => {
  const initContext = useContext(InitialContext);
  return (
    <div>
      <ReqoreControlGroup stack>
        <ReqoreTag label={`${index}.`} />
        <StringField
          placeholder={keyName}
          name={keyName}
          value={keyValue}
          onChange={(fieldName: string, value: string): void => {
            onChange(fieldName, value);
          }}
        />
        <StringField
          placeholder={valueName}
          name={valueName}
          value={valueValue}
          onChange={(fieldName: string, value: string) => {
            onChange(fieldName, value);
          }}
          fill
        />
        {canBeRemoved && (
          <ReqoreButton
            icon={'DeleteBinLine'}
            intent="danger"
            minimal
            onClick={() => initContext.confirmAction('ConfirmRemoveItem', onRemoveClick)}
            tooltip="Remove item"
          />
        )}
      </ReqoreControlGroup>
    </div>
  );
};

export default PairField;
