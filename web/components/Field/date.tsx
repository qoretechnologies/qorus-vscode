import React, { FunctionComponent, ChangeEvent } from 'react';
import { InputGroup, ButtonGroup, Button, Classes, ControlGroup } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import compose from 'recompose/compose';
import useMount from 'react-use/lib/useMount';
import withMessageHandler, { TPostMessage, TMessageListener } from '../../hocomponents/withMessageHandler';

export interface IDateField {
    t?: TTranslator;
    fill?: boolean;
    postMessage?: TPostMessage;
    addMessageListener?: TMessageListener;
}

const DateField: FunctionComponent<IDateField & IField & IFieldChange> = ({
    name,
    onChange,
    value,
    default_value,
    postMessage,
    addMessageListener,
    get_message,
    return_message,
    t,
}) => {
    // Fetch data on mount
    useMount(() => {
        // Populate default value
        if (default_value) {
            onChange(name, default_value);
        }
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
    const handleInputChange = (selectedDate: Date): void => {
        onChange(name, selectedDate);
    };

    // Clear the input on reset click
    const handleResetClick = (): void => {
        onChange(name, null);
    };

    return (
        <DateInput
            formatDate={date => date.toISOString()}
            parseDate={str => new Date(str)}
            placeholder={'D/M/YYYY'}
            invalidDateMessage={t('InvalidDate')}
            inputProps={{ className: Classes.FILL }}
            popoverProps={{
                targetTagName: 'div',
                wrapperTagName: 'div',
            }}
            value={!value ? new Date(default_value) || null : new Date(value)}
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

export default compose(withMessageHandler(), withTextContext())(DateField) as FunctionComponent<
    IDateField & IField & IFieldChange
>;
