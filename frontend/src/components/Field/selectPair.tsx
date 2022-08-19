import { Button, Classes, ControlGroup } from '@blueprintjs/core';
import { FunctionComponent, useContext } from 'react';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { InitialContext } from '../../context/init';
import FieldEnhancer from '../FieldEnhancer';
import SelectField from './select';
import StringField from './string';

export interface IPairField {
  keyName: string;
  valueName: string;
  keyValue?: string;
  valueValue?: string;
  index: number | string;
  onRemoveClick: () => void;
  get_message?: { action: string; object_type: string; return_value?: string };
  return_message?: { action: string; object_type: string; return_value?: string };
  selectFirst?: boolean;
  defaultSelectItems?: any[];
  canBeRemoved?: boolean;
  hideTextField?: boolean;
}

const SelectPairField: FunctionComponent<IField & IPairField & IFieldChange> = ({
  keyName,
  valueName,
  keyValue,
  valueValue,
  onChange,
  index,
  onRemoveClick,
  get_message,
  return_message,
  selectFirst,
  defaultSelectItems,
  canBeRemoved,
  hideTextField,
  reference,
  context,
  requestFieldData,
  iface_kind,
}) => {
  const initContext = useContext(InitialContext);
  return (
    <FieldEnhancer context={context}>
      {(onEditClick, onCreateClick) => (
        <div>
          <ControlGroup fill>
            <Button text={`${index}.`} className={Classes.FIXED} />
            {selectFirst ? (
              <>
                <SelectField
                  name={valueName}
                  value={valueValue}
                  get_message={get_message}
                  return_message={return_message}
                  defaultItems={defaultSelectItems}
                  reference={reference}
                  iface_kind={iface_kind}
                  onChange={(fieldName: string, value: string) => {
                    onChange(fieldName, value);
                  }}
                  requestFieldData={requestFieldData}
                  fill
                />
                {hideTextField && (
                  <StringField
                    name={keyName}
                    value={keyValue}
                    onChange={(fieldName: string, value: string): void => {
                      onChange(fieldName, value);
                    }}
                    fill
                  />
                )}
              </>
            ) : (
              <>
                {!hideTextField && (
                  <StringField
                    name={keyName}
                    value={keyValue}
                    onChange={(fieldName: string, value: string): void => {
                      onChange(fieldName, value);
                    }}
                    fill
                  />
                )}
                <SelectField
                  name={valueName}
                  value={valueValue}
                  get_message={get_message}
                  return_message={return_message}
                  defaultItems={defaultSelectItems}
                  reference={reference}
                  requestFieldData={requestFieldData}
                  iface_kind={iface_kind}
                  onChange={(fieldName: string, value: string) => {
                    onChange(fieldName, value);
                  }}
                  fill
                />
              </>
            )}
            {canBeRemoved && (
              <Button
                className={Classes.FIXED}
                icon={'trash'}
                intent="danger"
                onClick={() => initContext.confirmAction('ConfirmRemoveItem', onRemoveClick)}
              />
            )}
          </ControlGroup>
        </div>
      )}
    </FieldEnhancer>
  );
};

export default SelectPairField;
