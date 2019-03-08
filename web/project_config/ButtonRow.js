import React from 'react';
import { Button } from "@blueprintjs/core";
import { EditBtnGroup } from './EditBtnGroup';


export const ButtonRow = props => {
    const {active, onSelect, ...other_props} = props;
    return (
        <tr>
            <td style={{ minWidth: 120 }}>
                <Button fill={true}
                        active={active}
                        onClick={() => onSelect(props.data.id)}>
                    {props.data.name}
                </Button>
            </td>
            <td>
                <EditBtnGroup {...other_props} />
            </td>
        </tr>
    );
};
