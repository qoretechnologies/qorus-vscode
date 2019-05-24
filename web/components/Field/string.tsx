import React, { FunctionComponent, useState, ChangeEvent } from 'react';
import { InputGroup, ButtonGroup, Button } from '@blueprintjs/core';

export interface IStringField {
    onChange: (value: string) => any;
}

const StringField: FunctionComponent<IStringField> = ({ onChange }) => {
    const [value, setValue] = useState<string>('');

    // When input value changes
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        // Set the field value
        setValue(event.target.value);
        // Run the callback
        if (onChange) {
            onChange(event.target.value);
        }
    };

    // Clear the input on reset click
    const handleResetClick = (): void => {
        setValue('');
    };

    return (
        <InputGroup
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

export default StringField;
