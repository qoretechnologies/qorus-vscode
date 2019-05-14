import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ButtonGroup, Card, Classes, Colors, H4, InputGroup, Intent } from '@blueprintjs/core';
import { vscode } from '../common/vscode';


class Login extends Component {
    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'login-return-data':
                    this.props.setQorus(event.data.qorus_instance);
                    break;
                case 'login-error':
                    this.props.setLoginError(event.data.error);
                    break;
            }
        });
    }

    componentDidMount() {
        if (this.username_input) {
            this.username_input.focus();
        }

        if (this.props.qorus) {
            return;
        }

        vscode.postMessage({
            action: 'login-get-data'
        });
    }

    onSubmit = () => {
        vscode.postMessage({
            action: 'login-submit',
            username: this.props.username,
            password: this.props.password
        });
    }

    onCancel = () => {
        vscode.postMessage({
            action: 'login-cancel'
        });
    }

    render() {
        const t = this.props.t;
        const [qorus_name, qorus_url] = this.props.qorus
            ? [this.props.qorus.name, this.props.qorus.url]
            : ['',  ''];

        return (
            <Card className='login-card bp3-elevation-2'>
                <form className='login-grid' onSubmit={this.onSubmit}>
                    <div style={{ gridRow: 1, gridColumnStart: 2, gridColumnEnd: 6 }}>
                        <H4 style={{ textAlign: 'center' }}>
                            {t('LoginHeader')} &nbsp;
                            <span className='login-highlighted'>
                                {qorus_name}
                            </span> &nbsp;
                            {t('at')}
                        </H4>
                        <H4 className='login-highlighted text-center'>
                            {qorus_url}
                        </H4>
                    </div>

                    <div className='login-label'>
                        {t('LabelUsername')}
                    </div>
                    <div className='login-input'>
                        <InputGroup id='username' type='text' value={this.props.username}
                                    onChange={(ev) => this.props.setUsername(ev.target.value.trim())}
                                    inputRef={input => {this.username_input = input;}}
                        />
                    </div>
                    <div className='login-label'>
                        {t('LabelPassword')}
                    </div>
                    <div className='login-input'>
                        <InputGroup id='password' type='password' value={this.props.password}
                                    onChange={(ev) => this.props.setPassword(ev.target.value.trim())}
                        />
                    </div>
                    <ButtonGroup style={{ gridColumn: '3/5', marginTop: 12 }} fill={true}>
                        <Button icon='cross' className={Classes.POPOVER_DISMISS}
                                intent={Intent.DANGER} style={{ width: '50%'}}
                                onClick={this.onCancel}
                        >
                            &nbsp; {t('ButtonCancel')} &nbsp;
                        </Button>
                        <Button icon='log-in' type='submit' intent={Intent.SUCCESS} style={{ width: '50%'}}>
                            &nbsp; {t('ButtonLogin')} &nbsp;
                        </Button>
                    </ButtonGroup>
                </form>
                {this.props.error &&
                    <H4 style={{ textAlign: 'center', color: Colors.RED3, marginTop: 24 }}>
                        {this.props.error}
                    </H4>
                }
            </Card>
        );
    }
}

const mapStateToProps = state => ({
    qorus: state.login_qorus,
    username: state.login_data.username,
    password: state.login_data.password,
    error: state.login_error,
});

const mapDispatchToProps = dispatch => ({
    setQorus: qorus => dispatch({type: 'login_qorus', login_qorus: qorus}),
    setUsername: username => dispatch({type: 'login_username', username}),
    setPassword: password => dispatch({type: 'login_password', password}),
    setLoginError: error => dispatch({type: 'login_error', login_error: error}),
});

export const LoginContainer = connect(mapStateToProps, mapDispatchToProps)(Login);
