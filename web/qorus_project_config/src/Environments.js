import React, { Component } from 'react';
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export class Envs extends Component {
    render() {
        let buttonRows = [];
        let is_first = true;
        for (let env_id in this.props.data) {
            let env = this.props.data[env_id];
            buttonRows.push(<ButtonRow env_id={env_id}
                                       data={env}
                                       selectBtnClass={'btn-outline-info'}
                                       active={env_id == this.props.selected_env_id}
                                       onSelect={this.props.onSelect.bind(this)}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='col-sm-3'>
                {buttonRows}
                <AddButton label={global.texts.addEnvironment} action={'add-env'}
                           positionClass={'offset-sm-7 col-sm-5 text-left'} />
            </div>
        );
    }
}
