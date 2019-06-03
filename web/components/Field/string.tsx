import React, { FunctionComponent, useState, ChangeEvent } from 'react';
import { InputGroup, ButtonGroup, Button, Classes } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';

export interface IStringField {
    t: TTranslator;
    fill?: boolean;
}

const StringField: FunctionComponent<IStringField & IField & IFieldChange> = ({ name, onChange, t, fill }) => {
    const [value, setValue] = useState<string>('');

    // When input value changes
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        // Set the field value
        setValue(event.target.value);
        // Run the callback
        if (onChange) {
            onChange(name, event.target.value);
        }
    };

    // Clear the input on reset click
    const handleResetClick = (): void => {
        setValue('');
        // Run the callback
        if (onChange) {
            onChange(name, '');
        }
    };

    return (
        <InputGroup
            className={fill && Classes.FILL}
            value={value}
            onChange={handleInputChange}
            rightElement={
                value !== '' && (
                    <ButtonGroup minimal>
                        <Button onClick={handleResetClick} icon="cross" />
                    </ButtonGroup>
                )
            }
        />
    );
};

export default withTextContext()(StringField) as FunctionComponent<IStringField>;
