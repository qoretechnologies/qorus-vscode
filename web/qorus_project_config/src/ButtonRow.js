import React, { Component } from 'react';
import { EditBtnGroup } from './EditBtnGroup';


export class ButtonRow extends Component {
    render() {
        return (
            <div className='row'>
                <div className='col-7'>
                    <button className={'btn btn-lg btn-block ' + this.props.selectBtnClass
                                                        + (this.props.active ? ' active' : '')}
                            onClick={this.props.onSelect.bind(this, this.props.data.id)} >
                        {this.props.data.name}
                    </button>
                </div>
                <div className='col-5'>
                    <EditBtnGroup env_id={this.props.env_id}
                                  qorus_id={this.props.qorus_id}
                                  data={this.props.data}
                                  onMoveUp={this.props.onMoveUp ? this.props.onMoveUp.bind(this) : null} />
                </div>
            </div>
        );
    }
}
