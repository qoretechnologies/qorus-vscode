import { Intent } from '@blueprintjs/core';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { vscode } from '../common/vscode';
import String from '../components/Field/string';
import { TextContext } from '../context/text';
import withInitialDataConsumer from '../hocomponents/withInitialDataConsumer';
import withTextContext from '../hocomponents/withTextContext';

class Login extends Component {
  state = {
    loginInstance: null,
  };

  constructor() {
    super();

    window.addEventListener('message', (event) => {
      switch (event.data.action) {
        case 'login-return-data':
          this.setState({ loginInstance: event.data.login_instance });
          this.props.setUsername(event.data.login_instance.username);
          break;
        case 'login-error':
          this.props.setLoginError(event.data.error);
          break;
        case 'close-login':
          this.props.initialData.changeTab('ProjectConfig');
          break;
      }
    });
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.onSubmit();
    }
  };

  componentDidMount() {
    if (this.username_input) {
      this.username_input.focus();
    }

    // Submit the form when user presses enter
    document.addEventListener('keydown', this.handleKeyDown);

    vscode.postMessage({
      action: 'login-get-data',
    });
  }

  // Remove the event listener when the component is unmounted
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
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
        {(t) => (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ReqorePanel label={t('LoginHeader')}>
              <ReqoreTag
                labelKey={name}
                effect={{ gradient: { colors: '#7e2d90' }, weight: 'bold' }}
                label={safe_url}
              />
              {this.props.error && (
                <>
                  <ReqoreVerticalSpacer height={20} />
                  <ReqoreMessage intent="danger" size="small">
                    {this.props.error}
                  </ReqoreMessage>
                </>
              )}
              <ReqoreVerticalSpacer height={20} />
              <ReqoreControlGroup vertical fluid>
                <String
                  stack
                  id="username"
                  label={t('LabelUsername')}
                  type="text"
                  value={this.props.username}
                  onChange={(_name, v) => this.props.setUsername(v.trim())}
                />
                <String
                  stack
                  id="password"
                  sensitive
                  label={t('LabelPassword')}
                  value={this.props.password}
                  onChange={(_name, v) => this.props.setPassword(v.trim())}
                />
                <ReqoreVerticalSpacer height={20} />
                <ReqoreControlGroup vertical={false}>
                  <ReqoreButton icon="CloseLine" intent={Intent.DANGER} onClick={this.onCancel}>
                    {t('ButtonCancel')}
                  </ReqoreButton>
                  <ReqoreButton icon="LoginBoxLine" intent={Intent.SUCCESS} onClick={this.onSubmit}>
                    {t('ButtonLogin')}
                  </ReqoreButton>
                </ReqoreControlGroup>
              </ReqoreControlGroup>
            </ReqorePanel>
          </div>
        )}
      </TextContext.Consumer>
    );
  }
}

const mapStateToProps = (state, props) => ({
  qorus: state.login_qorus,
  username: state.login_data.username,
  password: state.login_data.password,
  error: state.login_error,
  ...props,
});

const mapDispatchToProps = (dispatch) => ({
  setQorus: (qorus) => dispatch({ type: 'login_qorus', login_qorus: qorus }),
  setUsername: (username) => dispatch({ type: 'login_username', username }),
  setPassword: (password) => dispatch({ type: 'login_password', password }),
  setLoginError: (error) => dispatch({ type: 'login_error', login_error: error }),
});

export const LoginContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTextContext(),
  withInitialDataConsumer()
)(Login);
