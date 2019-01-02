import React, { Component } from 'react';
import { HTMLTable } from "@blueprintjs/core";
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export class Qoruses extends Component {
    render() {
        if (!this.props.env) {
            return (
                <div className='config-item'>
                    <HTMLTable condensed={true}>
                        <thead>
                            <tr>
                                <th>
                                    <h5 className='config-color'>
                                        {global.texts.qorusInstances}
                                    </h5>
                                </th>
                            </tr>
                        </thead>
                    </HTMLTable>
                </div>
            );
        }

        let buttonRows = [];
        let env = this.props.env;
        let is_first = true;
        for (let qorus_id in env.qoruses) {
            buttonRows.push(<ButtonRow key={qorus_id}
                                       env_id={env.id}
                                       qorus_id={qorus_id}
                                       data={env.qoruses[qorus_id]}
                                       active={qorus_id == this.props.selected_qorus_id}
                                       onSelect={this.props.onSelect.bind(this)}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='config-item column-qoruses'>
                <HTMLTable condensed={true}>
                    <thead>
                        <tr>
                            <th colspan='2'>
                                <h5 className='config-color'>
                                    {global.texts.qorusInstancesIn}&nbsp;
                                    <span style={{ fontWeight: 'bold' }}>{env.name}</span>
                                </h5>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {buttonRows}
                        <AddButton label={global.texts.addQorus} action={'add-qorus'} env_id={env.id} />
                    </tbody>
                </HTMLTable>
            </div>
        );
    }
}
