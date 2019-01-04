import React, { Component } from 'react';
import { Button } from "@blueprintjs/core";
import { EditPopover } from './EditPopover';
import { setInputs } from './global';


export class AddButton extends Component {
    render() {
        let entity;
        if (this.props.qorus_id !== undefined) {
            entity = 'Url';
        }
        else if (this.props.env_id !== undefined) {
            entity = 'Qorus';
        }
        else {
            entity = 'Env';
        }

        return (
            <tr>
                <td />
                <td>
                    <EditPopover kind='add' entity={entity} {...this.props} />
                </td>
            </tr>
        );
    }
}
