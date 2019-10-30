import React, { FunctionComponent } from 'react';
import StringField from './string';
import { ControlGroup, Button } from '@blueprintjs/core';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import SelectField from './select';

export interface IPairField {
    keyName: string;
    valueName: string;
    keyValue: string;
    valueValue: string;
    index: number | string;
    onRemoveClick: () => void;
    get_message: { action: string; object_type: string; return_value?: string };
    return_message: { action: string; object_type: string; return_value?: string };
}

const SelectPairField: FunctionComponent<IPairField & IFieldChange> = ({
    keyName,
    valueName,
    keyValue,
    valueValue,
    onChange,
    index,
    onRemoveClick,
    get_message,
    return_message,
}) => (
    <div>
        <ControlGroup fill>
            <Button text={`${index}.`} />
            <StringField
                name={keyName}
                value={keyValue}
                onChange={(fieldName: string, value: string): void => {
                    onChange(fieldName, value);
                }}
                fill
            />
            <SelectField
                name={valueName}
                value={valueValue}
                get_message={get_message}
                return_message={return_message}
                onChange={(fieldName: string, value: string) => {
                    onChange(fieldName, value);
                }}
                fill
            />
            {index !== 1 && <Button icon={'trash'} onClick={onRemoveClick} />}
        </ControlGroup>
    </div>
);

export default SelectPairField;
