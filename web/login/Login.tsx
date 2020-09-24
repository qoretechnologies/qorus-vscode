import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ButtonGroup, Card, Classes, Colors, H4, InputGroup, Intent } from '@blueprintjs/core';
import { vscode } from '../common/vscode';
import { TextContext } from '../context/text';
import compose from 'recompose/compose';
import withTextContext from '../hocomponents/withTextContext';
import Box from '../components/Box';
import withInitialDataConsumer from '../hocomponents/withInitialDataConsumer';

class Login extends Component {
    state = {
        loginInstance: null,
    };

    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'login-return-data':
                    this.setState({ loginInstance: event.data.login_instance });
                    this.props.setUsername(event.data.username);
                    break;
                case 'login-error':
                    this.props.setLoginError(event.data.error);
                    break;
                case 'close-login':
                    this.props.initialData.changeTab('ProjectConfig');
            }
        });
    }

    componentDidMount() {
        if (this.username_input) {
            this.username_input.focus();
        }

        vscode.postMessage({
            action: 'login-get-data',
        });
    }

    onSubmit = () => {
        vscode.postMessage({
            action: 'login-submit',
            username: this.props.username,
            password: this.props.password,
        });
    };

    onCancel = () => {
        vscode.postMessage({
            action: 'login-cancel',
        });
    };

    render() {
        if (!this.state.loginInstance) {
            return <p> Loading... </p>;
        }

        const { name, safe_url, url } = this.state.loginInstance;

        return (
            <TextContext.Consumer>
                {t => (
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Box
                            style={{
                                flex: '0 auto',
                            }}
                        >
                            <form onSubmit={this.onSubmit}>
                                <div style={{ gridRow: 1, gridColumnStart: 2, gridColumnEnd: 6 }}>
                                    <H4 style={{ textAlign: 'center' }}>
                                        {t('LoginHeader')} &nbsp;
                                        <span className="login-highlighted">{name}</span> &nbsp;
                                        {t('at')}
                                    </H4>
                                    <H4 className="login-highlighted text-center">{safe_url}</H4>
                                </div>

                                <div className="login-label">{t('LabelUsername')}</div>
                                <div className="login-input">
                                    <InputGroup
                                        id="username"
                                        type="text"
                                        value={this.props.username}
                                        onChange={ev => this.props.setUsername(ev.target.value.trim())}
                                        inputRef={input => {
                                            this.username_input = input;
                                        }}
                                    />
                                </div>
                                <div className="login-label">{t('LabelPassword')}</div>
                                <div className="login-input">
                                    <InputGroup
                                        id="password"
                                        type="password"
                                        value={this.props.password}
                                        onChange={ev => this.props.setPassword(ev.target.value.trim())}
                                    />
                                </div>
                                <ButtonGroup style={{ gridColumn: '3/5', marginTop: 12 }} fill={true}>
                                    <Button
                                        icon="cross"
                                        className={Classes.POPOVER_DISMISS}
                                        intent={Intent.DANGER}
                                        style={{ width: '50%' }}
                                        onClick={this.onCancel}
                                    >
                                        &nbsp; {t('ButtonCancel')} &nbsp;
                                    </Button>
                                    <Button
                                        icon="log-in"
                                        type="submit"
                                        intent={Intent.SUCCESS}
                                        style={{ width: '50%' }}
                                    >
                                        &nbsp; {t('ButtonLogin')} &nbsp;
                                    </Button>
                                </ButtonGroup>
                            </form>
                            {this.props.error && (
                                <H4 style={{ textAlign: 'center', color: Colors.RED3, marginTop: 24 }}>
                                    {this.props.error}
                                </H4>
                            )}
                        </Box>
                    </div>
                )}
            </TextContext.Consumer>
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
    setQorus: qorus => dispatch({ type: 'login_qorus', login_qorus: qorus }),
    setUsername: username => dispatch({ type: 'login_username', username }),
    setPassword: password => dispatch({ type: 'login_password', password }),
    setLoginError: error => dispatch({ type: 'login_error', login_error: error }),
});

export const LoginContainer = compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTextContext(),
    withInitialDataConsumer()
)(Login);
