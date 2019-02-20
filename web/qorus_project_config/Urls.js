import React from 'react';
import { HTMLTable, H4, Button } from "@blueprintjs/core";
import { EditBtnGroup } from './EditBtnGroup';
import { EditPopover } from './EditPopover';
import { AddButton } from './AddButton';


export const Urls = props => {
    if (!props.selected_qorus) {
        return null;
    }

    const env_id = props.env_id;
    const qorus = props.selected_qorus;
    let customUrls = [];
    let is_first = true;

    for (let url_id in qorus.urls) {
        customUrls.push(<CustomUrl key={url_id}
                                   t={props.t}
                                   env_id={env_id}
                                   qorus_id={qorus.id}
                                   url={qorus.urls[url_id]}
                                   onEdit={props.onEdit}
                                   onRemove={props.onRemove}
                                   onMoveUp={is_first ? null : props.onMoveUp} />);
        is_first = false;
    }

    return (
        <div className='config-item'>
            <HTMLTable condensed={true}>
                <thead>
                    <tr>
                        <th colspan='2'>
                            <H4 className='config-color'>
                                {props.t('PropertiesOfQorusInstance')}&nbsp;
                                <span style={{ fontWeight: 'bold' }}>{qorus.name}</span>
                            </H4>
                        </th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th colspan='2'>
                            <span className='config-color'>{props.t('MainUrl')}</span>
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
                                         t={props.t}
                                         onEdit={props.onEdit} />
                        </td>
                    </tr>
                </tbody>
                <thead>
                    <tr>
                        <th colspan='2'>
                            <span className='config-color'>{props.t('CustomUrls')}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {customUrls}
                    <AddButton env_id={env_id} qorus_id={qorus.id} onEdit={props.onEdit} t={props.t} />
                </tbody>
            </HTMLTable>
        </div>
    );
};

const CustomUrl = props => {
    const {url, ...other_props} = props;
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
};
