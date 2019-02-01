import React, { Component } from 'react';
import { Button } from '@blueprintjs/core';


export class BackForwardButtons extends Component {
    render() {
        return (
            <>
                <div style={{display: 'flex', flexFlow: 'row nowrap',
                             justifyContent: 'space-between', marginBottom: 20}} >
                    <Button icon='arrow-left' onClick={this.props.onBack}>
                        {this.props.t('Back')}
                    </Button>
                    {this.props.onForward &&
                        <Button icon='arrow-right' onClick={this.props.onForward}>
                            {this.props.forward_text}
                        </Button>
                    }
                    {this.props.onClose &&
                        <Button icon='selection' onClick={this.props.onClose}>
                            {this.props.t('Close')}
                        </Button>
                    }
                </div>
                <hr />
            </>
        );
    }
}
