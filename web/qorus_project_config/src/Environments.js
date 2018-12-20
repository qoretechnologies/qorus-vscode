import React, { Component } from 'react';
import { AddButton } from './AddButton';
import { ButtonRow } from './ButtonRow';
import { texts } from './global';


export class Envs extends Component {
    render() {
        let buttonRows = [];
        let is_first = true;
        for (let env_id in this.props.data) {
            buttonRows.push(<ButtonRow key={env_id}
                                       env_id={env_id}
                                       data={this.props.data[env_id]}
                                       selectBtnClass={'btn-outline-info'}
                                       active={env_id == this.props.selected_env_id}
                                       onSelect={this.props.onSelect.bind(this)}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='col-12 col-sm-6 col-lg-4 mb-5'>
                <h4 className='config-header'>{global.texts.environments}</h4>
                {buttonRows}
                <AddButton label={global.texts.addEnvironment} action={'add-env'} />
            </div>
        );
    }
}
