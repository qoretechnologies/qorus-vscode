import React, { Component } from 'react';
import { Button, Classes, Dialog } from '@blueprintjs/core';


export const MessageDialog = (props) => {
    const {text, buttons, ...base_props} = props;

    let footer_buttons = [];
    for (let i in buttons) {
        const button = buttons[i];
        footer_buttons.push(
            <Button key={i}
                    intent={button.intent}
                    onClick={button.onClick}
                    className={Classes.POPOVER_DISMISS}>
                {button.title}
            </Button>
        );
    }

    return (
        <Dialog {...base_props}>
            <div className={Classes.DIALOG_BODY}>
                {text}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    {footer_buttons}
                </div>
            </div>
        </Dialog>
    );
}
