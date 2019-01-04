import React, { Component } from 'react';
import { Button, ButtonGroup, Classes, H5, Intent, Popover } from "@blueprintjs/core";
import { EditPopover } from './EditPopover';
import { texts } from './global';


export class EditBtnGroup extends Component {
    render() {
        let entity;
        if (this.props.url_id !== undefined) {
            entity = 'Url';
        }
        else if (this.props.qorus_id !== undefined) {
            entity = 'Qorus';
        }
        else {
            entity = 'Env';
        }

        const {onEdit, onRemove, onMoveUp, ... other_props} = this.props;

        return (
            <ButtonGroup>
                <EditPopover kind='edit' entity={entity} onEdit={onEdit} {...other_props} />
                <DeletePopover entity={entity} onRemove={onRemove} {...other_props} />
                {this.props.onMoveUp &&
                    <Button icon='arrow-up' title={global.texts.moveUp} role='button'
                            onClick={onMoveUp.bind(this, {env_id: this.props.env_id,
                                                          qorus_id: this.props.qorus_id,
                                                          url_id: this.props.url_id})} />
                }
            </ButtonGroup>
        );
    }
}

class DeletePopover extends Component {
    render() {
        return (
            <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
                <Button icon='trash' title={global.texts.remove} />
                <div>
                    <H5>{global.texts.confirmDeletion}</H5>

                    {global.texts['confirmRemove' + this.props.entity + 'Pre']}
                    <b>{this.props.data.name}</b>
                    {global.texts['confirmRemove' + this.props.entity + 'Post']}

                    <hr />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                            {global.texts.buttonCancel}
                        </Button>
                        <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS}
                                onClick={this.props.onRemove.bind(this, {env_id: this.props.env_id,
                                                                         qorus_id: this.props.qorus_id,
                                                                         url_id: this.props.url_id})}>
                            {global.texts.buttonDelete}
                        </Button>
                    </div>
                </div>
            </Popover>
        );
    }
}
