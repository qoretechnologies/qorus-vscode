import React from 'react';
import { HTMLTable, H4 } from "@blueprintjs/core";
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export const Envs = props => {
    let buttonRows = [];
    let is_first = true;
    for (let env_id in props.data) {
        buttonRows.push(<ButtonRow key={env_id}
                                   env_id={env_id}
                                   data={props.data[env_id]}
                                   active={env_id == props.selected_env_id}
                                   onSelect={props.onSelect}
                                   onEdit={props.onEdit}
                                   onRemove={props.onRemove}
                                   onMoveUp={is_first ? null : props.onMoveUp} />);
        is_first = false;
    }

    return (
        <div className='config-item column-envs'>
            <HTMLTable condensed={true}>
                <thead>
                    <tr>
                        <th colspan='2'>
                            <H4 className='config-color'>{global.texts.environments}</H4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {buttonRows}
                    <AddButton onEdit={props.onEdit} />
                </tbody>
            </HTMLTable>
        </div>
    );
};
