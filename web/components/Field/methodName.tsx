import { Button, Callout, Classes, ControlGroup, InputGroup } from '@blueprintjs/core';
import React, { FunctionComponent, useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { StyledDialogBody } from '../../containers/ClassConnectionsManager';
import { FieldInputWrapper, FieldWrapper, IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { MethodsContext } from '../../context/methods';
import { getValueOrDefaultValue, validateField } from '../../helpers/validations';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import FieldLabel from '../FieldLabel';
import String from './string';

export interface IStringField {
    t?: TTranslator;
    fill?: boolean;
    postMessage?: TPostMessage;
    addMessageListener?: TMessageListener;
    read_only?: boolean;
    placeholder?: string;
    canBeNull?: boolean;
}

const MethodNameField: FunctionComponent<IStringField & IField & IFieldChange> = ({
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
    t,
}) => {
    const [editManager, setEditManager] = useState<any>({});
    const methods = useContext(MethodsContext);

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
    const handleInputChange = (_name, value): void => {
        setEditManager((cur) => {
            const newCur = { ...cur };
            cur.value = value;
            return newCur;
        });
    };

    const isNameValid: (name: string) => boolean = (name) => {
        // Check if this method name already exists for this service
        const exists = methods.methods.find((method) => method.name === name);

        return validateField('string', name) && !exists;
    };

    const val = value || default_value;

    return (
        <ControlGroup fill>
            <InputGroup
                placeholder={placeholder}
                disabled={disabled}
                readOnly
                className={fill && Classes.FILL}
                value={val}
            />
            <Button
                name={'edit-method-name-button'}
                onClick={() => {
                    setEditManager({
                        isOpen: true,
                        startValue: val,
                        value: val,
                    });
                }}
                disabled={disabled}
                className={Classes.FIXED}
                icon={'edit'}
            />
            {editManager.isOpen && (
                <CustomDialog title={t('EditMethodName')} onClose={() => setEditManager({})} isOpen>
                    <StyledDialogBody style={{ flexFlow: 'column' }}>
                        <Callout intent="warning">{t('EditMethodNameTriggerWarning')}</Callout>
                        <FieldWrapper>
                            <FieldLabel isValid={isNameValid(editManager.value)} />
                            <FieldInputWrapper>
                                <String
                                    onChange={(_name, v) => setEditManager({ ...editManager, value: v })}
                                    value={editManager.value}
                                    name="methodName"
                                    fill
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <br />
                        <ControlGroup fill>
                            <Button
                                name={'save-method-name-button'}
                                text={t('Save')}
                                disabled={!isNameValid(editManager.value)}
                                onClick={() => {
                                    onChange(name, editManager.value, undefined, undefined, undefined, {
                                        originalName: editManager.startValue,
                                    });
                                    setEditManager({});
                                }}
                                icon={'small-tick'}
                                intent="success"
                            />
                        </ControlGroup>
                    </StyledDialogBody>
                </CustomDialog>
            )}
        </ControlGroup>
    );
};

export default compose(withMessageHandler(), withTextContext())(MethodNameField) as FunctionComponent<
    IStringField & IField & IFieldChange
>;
