import React from 'react';
import { HTMLTable, H4 } from "@blueprintjs/core";
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export const Qoruses = props => {
    if (!props.selected_env) {
        return null;
    }

    let buttonRows = [];
    const env = props.selected_env;
    let is_first = true;
    for (let qorus_id in env.qoruses) {
        buttonRows.push(<ButtonRow key={qorus_id}
                                   env_id={env.id}
                                   qorus_id={qorus_id}
                                   data={env.qoruses[qorus_id]}
                                   active={qorus_id == props.selected_qorus_id}
                                   onSelect={props.onSelect}
                                   onEdit={props.onEdit}
                                   onRemove={props.onRemove}
                                   onMoveUp={is_first ? null : props.onMoveUp} />);
        is_first = false;
    }

    return (
        <div className='config-item column-qoruses'>
            <HTMLTable condensed={true}>
                <thead>
                    <tr>
                        <th colspan='2'>
                            <H4 className='config-color'>
                                {global.texts.qorusInstancesIn}&nbsp;
                                <span style={{ fontWeight: 'bold' }}>{env.name}</span>
                            </H4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {buttonRows}
                    <AddButton env_id={env.id} onEdit={props.onEdit} />
                </tbody>
            </HTMLTable>
        </div>
    );
};
