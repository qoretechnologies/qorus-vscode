import React, { Component } from 'react';
import { AddButton } from './AddButton';
import { EditBtnGroup } from './EditBtnGroup';
import { texts, setInputs } from './global';


export class Urls extends Component {
    render() {
        if (!this.props.qorus) {
            return null;
        }

        let customUrls = [];
        let env_id = this.props.env_id;
        let qorus = this.props.qorus;
        let is_first = true;
        for (let url_id in qorus.urls) {
            customUrls.push(<CustomUrl env_id={env_id} qorus_id={qorus.id} url={qorus.urls[url_id]}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='col-sm-8 col-lg-4'>
                <h4 className='config-header'>
                    {global.texts.urlsOf}&nbsp;
                    <span className='text-info font-weight-bold'>{qorus.name}</span>
                </h4>
                <h4>
                    {global.texts.mainUrl}
                </h4>
                <div className='row'>
                    <div className='col-7'>{qorus.url}</div>
                    <div className='col-5'>
                        <div className='btn-group btn-group-sm d-flex' role='group'>
                            <button className='btn btn-outline-primary w-25 float-right' title={global.texts.edit}
                                    role='button' data-target='#edit_config_modal' data-toggle='modal'
                                    data-text={global.texts.editMainUrl} data-action='edit-main-url'
                                    data-env-id={env_id} data-qorus-id={qorus.id} data-url={qorus.url}
                                    onClick={setInputs.bind(this, qorus.name, qorus.url)} >
                               <i className='fas fa-pencil-alt'></i>
                            </button>
                        </div>
                    </div>
                </div>
                <br />
                <h4>{global.texts.customUrls}</h4>
                {customUrls}
                <AddButton label={global.texts.addUrl} action={'add-url'} env_id={env_id} qorus_id={qorus.id} />
            </div>
        );
    }
}

class CustomUrl extends Component {
    render() {
        let url = this.props.url;

        return (
            <span>
                <div className='row mt-5'>
                    <div className='font-weight-bold col-7'>{url.name}</div>
                    <div className='col-5'>
                        <EditBtnGroup env_id={this.props.env_id}
                                      qorus_id={this.props.qorus_id}
                                      url_id={url.id}
                                      data={url}
                                      onMoveUp={this.props.onMoveUp ? this.props.onMoveUp.bind(this) : null} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>{url.url}</div>
                </div>
            </span>
        );
    }
}
