import React, { Component } from 'react';
import { Button, Classes, Dialog } from '@blueprintjs/core';
import { texts } from './global';


export class MessageDialog extends Component {
    render() {
        const {params, ...other_props} = this.props;

        let buttons = [];
        for (let i in params.buttons) {
            const button = params.buttons[i];
            buttons.push(
                <Button key={i}
                        intent={button.intent}
                        onClick={button.onClick}
                        className={Classes.POPOVER_DISMISS}>
                    {button.title}
                </Button>
            );
        }

        return (
            <Dialog canOutsideClickClose={true} canEscapeKeyClose={true} {...other_props}>
                <div className={Classes.DIALOG_BODY}>
                    {params.text}
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        {buttons}
                    </div>
                </div>
            </Dialog>
        );
    }
}
