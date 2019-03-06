import React from 'react';
import { Button, ButtonGroup, Classes, H5, Intent, Popover } from "@blueprintjs/core";
import { EditPopover } from './EditPopover';
import { T } from '../common/Translate';


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
                <Button icon='arrow-up' title=<T t='MoveUp' /> role='button'
                        onClick={onMoveUp.bind(null, {env_id: props.env_id,
                                                      qorus_id: props.qorus_id,
                                                      url_id: props.url_id})} />
            }
        </ButtonGroup>
    );
};

const DeletePopover = props => (
    <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
        <Button icon='trash' title=<T t='Remove' /> />
        <div>
            <H5><T t='ConfirmDeletion' /></H5>

            <T t={'ConfirmRemove' + props.entity + 'Pre'} />
            <b>{props.data.name}</b>
            <T t={'ConfirmRemove' + props.entity + 'Post'} />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 27 }}>
                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                    <T t='ButtonCancel' />
                </Button>
                <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS}
                        onClick={props.onRemove.bind(null, {env_id: props.env_id,
                                                            qorus_id: props.qorus_id,
                                                            url_id: props.url_id})}>
                    <T t='ButtonDelete' />
                </Button>
            </div>
        </div>
    </Popover>
);
