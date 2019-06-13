import React, { FunctionComponent, ChangeEvent } from 'react';
import { InputGroup, ButtonGroup, Button, Classes } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';

export interface IStringField {
    t: TTranslator;
    fill?: boolean;
}

const StringField: FunctionComponent<IStringField & IField & IFieldChange> = ({ name, onChange, value, fill }) => {
    // When input value changes
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onChange(name, event.target.value);
    };

    // Clear the input on reset click
    const handleResetClick = (): void => {
        onChange(name, '');
    };

    return (
        <InputGroup
            className={fill && Classes.FILL}
            value={value}
            onChange={handleInputChange}
            rightElement={
                value &&
                value !== '' && (
                    <ButtonGroup minimal>
                        <Button onClick={handleResetClick} icon={'cross'} />
                    </ButtonGroup>
                )
            }
        />
    );
};

export default withTextContext()(StringField) as FunctionComponent<IStringField>;
