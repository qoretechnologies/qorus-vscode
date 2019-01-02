import React, { Component } from 'react';
import { Button } from "@blueprintjs/core";
import { setInputs } from './global';


export class AddButton extends Component {
    render() {
        return (
            <tr>
                <td />
                <td>
                    <Button icon='plus'
                            title={this.props.label} role='button'
                            href='#edit_config_modal' data-toggle='modal' data-target='#edit_config_modal'
                            data-text={this.props.label} data-action={this.props.action}
                            data-env-id={this.props.env_id} data-qorus-id={this.props.qorus_id}
                            onClick={setInputs.bind(this, undefined, undefined)} >
                    </Button>
                </td>
            </tr>
        );
    }
}
