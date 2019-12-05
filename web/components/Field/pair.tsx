import React, { FunctionComponent } from 'react';
import StringField from './string';
import { ControlGroup, Button } from '@blueprintjs/core';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';

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
}) => (
    <div>
        <ControlGroup>
            <Button text={`${index}.`} />
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
            {canBeRemoved && <Button icon={'trash'} onClick={onRemoveClick} />}
        </ControlGroup>
    </div>
);

export default PairField;
