import React, { Component } from 'react';
import { Button } from '@blueprintjs/core';


export class BackForwardButtons extends Component {
    render() {
        return (
            <div>
                <div style={{display: 'flex', flexFlow: 'row nowrap',
                             justifyContent: 'space-between', marginBottom: 20}} >
                    <Button icon='arrow-left' onClick={this.props.onBack}>
                        Back
                    </Button>
                    <Button icon='arrow-right' onClick={this.props.onForward}>
                        {this.props.forward_text}
                    </Button>
                </div>
                <hr />
            </div>
        );
    }
}
