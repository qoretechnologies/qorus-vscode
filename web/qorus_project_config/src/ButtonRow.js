import React, { Component } from 'react';
import { Button } from "@blueprintjs/core";
import { EditBtnGroup } from './EditBtnGroup';


export class ButtonRow extends Component {
    render() {
        return (
            <tr>
                <td style={{ minWidth: '120px' }}>
                    <Button fill={true}
                            active={this.props.active}
                            onClick={this.props.onSelect.bind(this, this.props.data.id)} >
                        {this.props.data.name}
                    </Button>
                </td>
                <td>
                    <EditBtnGroup env_id={this.props.env_id}
                                  qorus_id={this.props.qorus_id}
                                  data={this.props.data}
                                  onMoveUp={this.props.onMoveUp ? this.props.onMoveUp.bind(this) : null} />
                </td>
            </tr>
        );
    }
}
