import React, { Component } from 'react';
import { vscode } from '../common/vscode';


export class T extends Component {
    static texts = {};

    componentDidMount() {
        window.addEventListener('message', event => {
            if (event.data.action == 'return-text') {
                T.texts[event.data.text_id] = event.data.text;
                if (event.data.text_id == this.props.t) {
                    this.forceUpdate();
                }
            }
        });
    }

    render() {
        if (!this.props.t) {
            return null;
        }

        if (!T.texts[this.props.t]) {
            vscode.postMessage({
                action: 'get-text',
                text_id: this.props.t
            });
            return null;
        }

        return T.texts[this.props.t];
    }
}
