import React, { Component } from 'react';
import { Button, ButtonGroup, Card, Classes, H4, InputGroup, Intent } from '@blueprintjs/core';
import { vscode } from '../common/vscode';
import { T } from '../common/Translate';
import logo from '../../images/qorus_logo_256.png';


export class Root extends Component {
    constructor() {
        super();

        this.qorus = null;

        const state = vscode.getState();
        if (state) {
            this.username = state.username;
            this.password = state.password;
        }

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-data':
                    this.qorus = event.data.qorus;
                    this.forceUpdate();
                    break;
            }
        });
    }

    componentDidMount() {
        if (this.qorus) {
            return;
        }

        vscode.postMessage({
            action: 'get-data'
        });
    }

    onSubmit = () => {
        vscode.postMessage({
            action: 'form-submit',
            username: this.username,
            password: this.password
        });
    }

    onCancel = () => {
        vscode.postMessage({
            action: 'form-cancel'
        });
    }

    onChange = (field, ev) => {
        this[field] = ev.target.value.trim();
        vscode.setState(Object.assign(vscode.getState() || {}, {[field]: this[field]}));
    }

    render() {
        if (!this.qorus) {
            return null;
        }

        const t = this.t;

        return (
            <Card className='login-card bp3-elevation-2'>
                <form className='grid-container' onSubmit={this.onSubmit}>
                    <div style={{ gridRow: 1, gridColumn: 1 }}>
                        <img style={{ width: 36, height: 36 }} src={logo} />
                    </div>
                    <div style={{ gridRow: 1, gridColumnStart: 2, gridColumnEnd: 6 }}>
                        <H4>
                            <T t='LoginHeader' /> &nbsp;
                            <span className='highlighted'>
                                {this.qorus.name}
                            </span> &nbsp;
                            <T t='at' />
                        </H4>
                        <H4 className='highlighted'>
                            {this.qorus.url}
                        </H4>
                    </div>

                    <div className='label'>
                        <T t='LabelUsername' />
                    </div>
                    <div className='input'>
                        <InputGroup id='username' type='text' value={this.username}
                                    onChange={this.onChange.bind(null, 'username')}
                                    inputRef={input => {if (input ) {input.focus();}}} />
                    </div>
                    <div className='label'>
                        <T t='LabelPassword' />
                    </div>
                    <div className='input'>
                        <InputGroup id='password' type='password' value={this.password}
                                    onChange={this.onChange.bind(null, 'password')} />
                    </div>
                    <ButtonGroup style={{ gridColumn: '3/5', marginTop: 12 }} fill={true}>
                        <Button icon='cross' className={Classes.POPOVER_DISMISS}
                                intent={Intent.DANGER} style={{ width: '50%'}}
                                onClick={this.onCancel}
                        >
                            &nbsp; <T t='ButtonCancel' /> &nbsp;
                        </Button>
                        <Button icon='log-in' type='submit' intent={Intent.SUCCESS} style={{ width: '50%'}}>
                            &nbsp; <T t='ButtonLogin' /> &nbsp;
                        </Button>
                    </ButtonGroup>
                </form>
            </Card>
        );
    }
}
