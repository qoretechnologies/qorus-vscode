import React from 'react';
import { EditPopoverContainer as EditPopover } from './EditPopover';


export const AddButton = props => {
    let entity;
    if (props.qorus_id !== undefined) {
        entity = 'Url';
    }
    else if (props.env_id !== undefined) {
        entity = 'Qorus';
    }
    else {
        entity = 'Env';
    }

    return (
        <tr>
            <td />
            <td>
                <EditPopover kind='add' entity={entity} {...props} />
            </td>
        </tr>
    );
};
