import { Button, ButtonGroup, Classes, InputGroup } from '@blueprintjs/core';
import React, { ChangeEvent, FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { isNull } from 'util';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { getValueOrDefaultValue } from '../../helpers/validations';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface IStringField {
    t?: TTranslator;
    fill?: boolean;
    postMessage?: TPostMessage;
    addMessageListener?: TMessageListener;
    read_only?: boolean;
    placeholder?: string;
    canBeNull?: boolean;
    sensitive?: boolean;
}

const StringField: FunctionComponent<IStringField & IField & IFieldChange> = ({
    name,
    onChange,
    value,
    default_value,
    fill,
    postMessage,
    addMessageListener,
    get_message,
    return_message,
    read_only,
    disabled,
    placeholder,
    canBeNull,
    sensitive,
}) => {
    // Fetch data on mount
    useMount(() => {
        // Populate default value
        onChange && onChange(name, getValueOrDefaultValue(value, default_value, canBeNull));
        // Get backend data
        if (get_message && return_message) {
            postMessage(get_message.action);
            addMessageListener(return_message.action, (data: any) => {
                if (data) {
                    onChange(name, data[return_message.return_value]);
                }
            });
        }
    });

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
            name={`field-${name}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={read_only}
            className={fill && Classes.FILL}
            value={canBeNull && isNull(value) ? 'Value set to [null]' : !value ? default_value || '' : value}
            onChange={handleInputChange}
            type={sensitive ? 'password' : 'text'}
            rightElement={
                value &&
                value !== '' &&
                !read_only &&
                !disabled && (
                    <ButtonGroup minimal>
                        <Button onClick={handleResetClick} icon={'cross'} />
                    </ButtonGroup>
                )
            }
        />
    );
};

export default compose(withMessageHandler(), withTextContext())(StringField) as FunctionComponent<
    IStringField & IField & IFieldChange
>;
