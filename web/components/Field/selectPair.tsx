import React, { FunctionComponent, useContext } from 'react';
import StringField from './string';
import { ControlGroup, Button, Classes } from '@blueprintjs/core';
import { IFieldChange, IField } from '../../containers/InterfaceCreator/panel';
import SelectField from './select';
import { InitialContext } from '../../context/init';
import FieldEnhancer from '../FieldEnhancer';

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
}) => {
    const initContext = useContext(InitialContext);
    return (
        <FieldEnhancer>
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
                                    onChange={(fieldName: string, value: string) => {
                                        onChange(fieldName, value);
                                    }}
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
