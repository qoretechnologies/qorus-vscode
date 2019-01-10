import React, { Component } from 'react';
import { Button } from "@blueprintjs/core";
import { EditBtnGroup } from './EditBtnGroup';


export class ButtonRow extends Component {
    render() {
        const {active, onSelect, ...other_props} = this.props;
        return (
            <tr>
                <td style={{ minWidth: '120px' }}>
                    <Button fill={true}
                            active={active}
                            onClick={onSelect.bind(this, this.props.data.id)}>
                        {this.props.data.name}
                    </Button>
                </td>
                <td>
                    <EditBtnGroup {...other_props} />
                </td>
            </tr>
        );
    }
}
