import React, { Component } from 'react';
import { texts, setInputs, setRemovedName } from './global';


export class EditBtnGroup extends Component {
    render() {
        let data = this.props.data;

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

        let data_text = global.texts['edit' + entity],
            data_text_1 = global.texts['confirmRemove' + entity + '1'],
            data_text_2 = global.texts['confirmRemove' + entity + '2'],
            data_action_edit = 'edit-' + entity.toLowerCase(),
            data_action_remove = 'remove-' + entity.toLowerCase();

        return (
            <div className='btn-group btn-group-sm d-flex my-2' role='group'>
                <button className='btn btn-outline-primary w-25' title={global.texts.edit} role='button'
                            data-target='#edit_config_modal' data-toggle='modal'
                            data-text={data_text} data-action={data_action_edit}
                            data-env-id={this.props.env_id} data-qorus-id={this.props.qorus_id}
                            data-url-id={this.props.url_id} data-name={data.name}
                            onClick={setInputs.bind(this, data.name, data.url)} >
                    <i className='fas fa-pencil-alt'></i>
                </button>
                <button className='btn btn-outline-danger w-25' title={global.texts.remove}
                            role='button' data-target='#remove_config_modal' data-toggle='modal'
                            data-text-1={data_text_1} data-text-2={data_text_2}
                            data-action={data_action_remove} data-env-id={this.props.env_id}
                            data-qorus-id={this.props.qorus_id} data-url-id={this.props.url_id}
                            data-name={data.name} onClick={setRemovedName.bind(this, data.name)} >
                    <i className='fas fa-times'></i>
                </button>
                {this.props.onMoveUp ?
                    <button className='btn btn-outline-warning w-25' title={global.texts.moveUp} role='button'
                            onClick={this.props.onMoveUp.bind(this, this.props.env_id,
                                                              this.props.qorus_id, this.props.url_id)}>
                        <i className='fas fa-arrow-up'></i>
                    </button> : null}
            </div>
        );
    }
}
