import React, { Component } from 'react';
import { setInputs } from './global';


export class AddButton extends Component {
    render() {
        return (
            <div className='row'>
                <div className='offset-7 col-5'>
                    <div className='btn-group btn-group-sm d-flex mt-4' role='group' style={{marginLeft: '-20px'}}>
                        <button className='btn btn-outline-success w-25' title={this.props.label} role='button'
                                href='#edit_config_modal' data-toggle='modal' data-target='#edit_config_modal'
                                data-text={this.props.label} data-action={this.props.action}
                                data-env-id={this.props.env_id} data-qorus-id={this.props.qorus_id}
                                onClick={setInputs.bind(this, undefined, undefined)} >
                            <i className='fas fa-plus'></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
