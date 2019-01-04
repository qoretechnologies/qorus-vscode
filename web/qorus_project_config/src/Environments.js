import React, { Component } from 'react';
import { HTMLTable } from "@blueprintjs/core";
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export class Envs extends Component {
    render() {
        let buttonRows = [];
        let is_first = true;
        for (let env_id in this.props.data) {
            buttonRows.push(<ButtonRow key={env_id}
                                       env_id={env_id}
                                       data={this.props.data[env_id]}
                                       active={env_id == this.props.selected_env_id}
                                       onSelect={this.props.onSelect}
                                       onEdit={this.props.onEdit}
                                       onRemove={this.props.onRemove}
                                       onMoveUp={is_first ? null : this.props.onMoveUp} />);
            is_first = false;
        }

        return (
            <div className='config-item column-envs'>
                <HTMLTable condensed={true}>
                    <thead>
                        <tr>
                            <th colspan='2'>
                                <h5 className='config-color'>{global.texts.environments}</h5>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {buttonRows}
                        <AddButton onEdit={this.props.onEdit} />
                    </tbody>
                </HTMLTable>
            </div>
        );
    }
}
