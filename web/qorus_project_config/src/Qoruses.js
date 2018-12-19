import React, { Component } from 'react';
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export class Qoruses extends Component {
    render() {
        if (!this.props.env) {
            return null;
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
            <div className='col-sm-3'>
                {buttonRows}
                <AddButton label={global.texts.addQorus} action={'add-qorus'} env_id={env.id}
                           positionClass={'offset-sm-7 col-sm-5 text-left'} />
            </div>
        );
    }
}
