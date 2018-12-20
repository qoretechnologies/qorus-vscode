import React, { Component } from 'react';
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export class Qoruses extends Component {
    render() {
        if (!this.props.env) {
            return (
                <div className='col-12 col-sm-6 col-lg-4'>
                    <h4>{global.texts.qorusInstances}</h4>
                </div>
            );
        }

        let buttonRows = [];
        let env = this.props.env;
        let is_first = true;
        for (let qorus_id in env.qoruses) {
            let qorus = env.qoruses[qorus_id];
            buttonRows.push(<ButtonRow env_id={env.id}
                                       qorus_id={qorus_id}
                                       data={qorus}
                                       selectBtnClass={'btn-outline-info'}
                                       active={qorus_id == this.props.selected_qorus_id}
                                       onSelect={this.props.onSelect.bind(this)}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='col-12 col-sm-6 col-lg-4 mb-5'>
                <h4 className='config-header'>
                    {global.texts.qorusInstancesIn}&nbsp;
                    <span className='text-info font-weight-bold'>{env.name}</span>
                </h4>
                {buttonRows}
                <AddButton label={global.texts.addQorus} action={'add-qorus'} env_id={env.id} />
            </div>
        );
    }
}
