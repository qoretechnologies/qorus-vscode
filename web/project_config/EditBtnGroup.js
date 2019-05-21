import React from 'react';
import { Button, ButtonGroup, Classes, H5, Intent, Popover } from '@blueprintjs/core';
import { EditPopoverContainer as EditPopover } from './EditPopover';
import withTextContext from '../hocomponents/withTextContext';

export const EditBtnGroup = withTextContext()(props => {
    let entity;
    if (props.url_id !== undefined) {
        entity = 'Url';
    } else if (props.qorus_id !== undefined) {
        entity = 'Qorus';
    } else {
        entity = 'Env';
    }

    const { onEdit, onRemove, onMoveUp, ...other_props } = props;

    return (
        <ButtonGroup>
            <EditPopover kind="edit" entity={entity} onEdit={onEdit} {...other_props} />
            <DeletePopover entity={entity} onRemove={onRemove} {...other_props} />
            {props.onMoveUp && (
                <Button
                    icon="arrow-up"
                    title={props.t('MoveUp')}
                    role="button"
                    onClick={onMoveUp.bind(null, {
                        env_id: props.env_id,
                        qorus_id: props.qorus_id,
                        url_id: props.url_id,
                    })}
                />
            )}
        </ButtonGroup>
    );
});

const DeletePopover = withTextContext()(props => (
    <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
        <Button icon="trash" title={props.t('Remove')} />
        <div>
            <H5>{props.t('ConfirmDeletion')}</H5>

            {props.t('ConfirmRemove' + props.entity + 'Pre')}
            <b>{props.data.name}</b>
            {props.t('ConfirmRemove' + props.entity + 'Post')}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 27 }}>
                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                    {props.t('ButtonCancel')}
                </Button>
                <Button
                    intent={Intent.DANGER}
                    className={Classes.POPOVER_DISMISS}
                    onClick={props.onRemove.bind(null, {
                        env_id: props.env_id,
                        qorus_id: props.qorus_id,
                        url_id: props.url_id,
                    })}
                >
                    {props.t('ButtonDelete')}
                </Button>
            </div>
        </div>
    </Popover>
));
