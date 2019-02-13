import React from 'react';
import { Button, ButtonGroup, Classes, H5, Intent, Popover } from "@blueprintjs/core";
import { EditPopover } from './EditPopover';
import { texts } from './global';


export const EditBtnGroup = props => {
    let entity;
    if (props.url_id !== undefined) {
        entity = 'Url';
    }
    else if (props.qorus_id !== undefined) {
        entity = 'Qorus';
    }
    else {
        entity = 'Env';
    }

    const {onEdit, onRemove, onMoveUp, ... other_props} = props;

    return (
        <ButtonGroup>
            <EditPopover kind='edit' entity={entity} onEdit={onEdit} {...other_props} />
            <DeletePopover entity={entity} onRemove={onRemove} {...other_props} />
            {props.onMoveUp &&
                <Button icon='arrow-up' title={global.texts.moveUp} role='button'
                        onClick={onMoveUp.bind(null, {env_id: props.env_id,
                                                      qorus_id: props.qorus_id,
                                                      url_id: props.url_id})} />
            }
        </ButtonGroup>
    );
};

const DeletePopover = props => (
    <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
        <Button icon='trash' title={global.texts.remove} />
        <div>
            <H5>{global.texts.confirmDeletion}</H5>

            {global.texts['confirmRemove' + props.entity + 'Pre']}
            <b>{props.data.name}</b>
            {global.texts['confirmRemove' + props.entity + 'Post']}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 27 }}>
                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                    {global.texts.buttonCancel}
                </Button>
                <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS}
                        onClick={props.onRemove.bind(null, {env_id: props.env_id,
                                                            qorus_id: props.qorus_id,
                                                            url_id: props.url_id})}>
                    {global.texts.buttonDelete}
                </Button>
            </div>
        </div>
    </Popover>
);
