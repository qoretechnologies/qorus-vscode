/* @flow */
import React from 'react';
import withHandlers from 'recompose/withHandlers';
import pure from 'recompose/onlyUpdateForKeys';
import compose from 'recompose/compose';
import { InputGroup } from '@blueprintjs/core';

type Props = {
    placeholder?: string;
    applyOnBlur?: boolean;
    inputDate: string;
    onApplyDate: () => void;
    onInputChange: (event: Object) => void;
    onKeyUp: (event: Object) => void;
    onInputClick: (event: Object) => number;
    id?: string;
    name?: string;
    className?: string;
    disabled: boolean;
};

const Input = (props: Props) => (
    <InputGroup
        type="text"
        onBlur={props.applyOnBlur ? props.onApplyDate : null}
        value={props.inputDate}
        onChange={props.onInputChange}
        onKeyUp={props.onKeyUp}
        onClick={props.onInputClick}
        placeholder={props.placeholder}
        id={props.id}
        name={props.name}
        className={props.className}
        disabled={props.disabled}
    />
);

const addKeyUpHandler = withHandlers({
    onKeyUp: ({ onApplyDate }: { onApplyDate: Function }): Function => (e: Object) => {
        if (e.keyCode === 13) {
            onApplyDate();
        }
    },
});

export default compose(
    addKeyUpHandler,
    pure(['inputDate', 'disabled'])
)(Input);
