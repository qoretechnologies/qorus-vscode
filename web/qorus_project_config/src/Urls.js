import React, { Component } from 'react';
import { HTMLTable, Button } from "@blueprintjs/core";
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
            customUrls.push(<CustomUrl key={url_id}
                                       env_id={env_id}
                                       qorus_id={qorus.id}
                                       url={qorus.urls[url_id]}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='config-item column-urls'>
                <HTMLTable condensed={true}>
                    <thead>
                        <tr>
                            <th colspan='2'>
                                <h5 className='config-color'>
                                    {global.texts.propertiesOfQorus}&nbsp;
                                    <span style={{ fontWeight: 'bold' }}>{qorus.name}</span>
                                </h5>
                            </th>
                        </tr>
                    </thead>
                    <thead>
                        <tr>
                            <th colspan='2'>
                                <span className='config-color'>{global.texts.mainUrl}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <span className='config-color'>{qorus.url}</span>
                            </td>
                            <td>
                                <Button icon='edit' title={global.texts.edit}
                                    role='button' data-target='#edit_config_modal' data-toggle='modal'
                                    data-text={global.texts.editMainUrl} data-action='edit-main-url'
                                    data-env-id={env_id} data-qorus-id={qorus.id} data-url={qorus.url}
                                    onClick={setInputs.bind(this, qorus.name, qorus.url)} >
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                    <thead>
                        <tr>
                            <th colspan='2'>
                                <span className='config-color'>{global.texts.customUrls}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customUrls}
                        <AddButton label={global.texts.addUrl} action={'add-url'} env_id={env_id} qorus_id={qorus.id} />
                    </tbody>
                </HTMLTable>
            </div>
        );
    }
}

class CustomUrl extends Component {
    render() {
        let url = this.props.url;

        return (
            <tr>
                <td>
                    <span className='config-color'>
                        <span style={{ fontWeight: 'bold' }}>{url.name}</span>
                        <br />
                        {url.url}
                    </span>
                </td>
                <td>
                    <EditBtnGroup env_id={this.props.env_id}
                                  qorus_id={this.props.qorus_id}
                                  url_id={url.id}
                                  data={url}
                                  onMoveUp={this.props.onMoveUp ? this.props.onMoveUp.bind(this) : null} />
                </td>
            </tr>
        );
    }
}
