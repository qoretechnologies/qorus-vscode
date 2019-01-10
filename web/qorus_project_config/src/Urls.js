import React, { Component } from 'react';
import { HTMLTable, H4, Button } from "@blueprintjs/core";
import { EditBtnGroup } from './EditBtnGroup';
import { EditPopover } from './EditPopover';
import { AddButton } from './AddButton';
import { texts } from './global';


export class Urls extends Component {
    render() {
        if (!this.props.selected_qorus) {
            return null;
        }

        const env_id = this.props.env_id;
        const qorus = this.props.selected_qorus;
        let customUrls = [];
        let is_first = true;

        for (let url_id in qorus.urls) {
            customUrls.push(<CustomUrl key={url_id}
                                       env_id={env_id}
                                       qorus_id={qorus.id}
                                       url={qorus.urls[url_id]}
                                       onEdit={this.props.onEdit}
                                       onRemove={this.props.onRemove}
                                       onMoveUp={is_first ? null : this.props.onMoveUp} />);
            is_first = false;
        }

        return (
            <div className='config-item column-urls'>
                <HTMLTable condensed={true}>
                    <thead>
                        <tr>
                            <th colspan='2'>
                                <H4 className='config-color'>
                                    {global.texts.propertiesOfQorus}&nbsp;
                                    <span style={{ fontWeight: 'bold' }}>{qorus.name}</span>
                                </H4>
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
                                <EditPopover kind='edit' entity='Url'
                                             env_id={env_id} qorus_id={qorus.id}
                                             action='edit-main-url' data={qorus}
                                             onEdit={this.props.onEdit} />
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
                        <AddButton env_id={env_id} qorus_id={qorus.id} onEdit={this.props.onEdit} />
                    </tbody>
                </HTMLTable>
            </div>
        );
    }
}

class CustomUrl extends Component {
    render() {
        const {url, ...other_props}  = this.props;
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
                    <EditBtnGroup url_id={url.id} data={url} {...other_props} />
                </td>
            </tr>
        );
    }
}
