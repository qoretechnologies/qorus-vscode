import { AnchorButton, ButtonGroup, Callout } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/table/lib/css/table.css';
import 'normalize.css/normalize.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import styled, { createGlobalStyle } from 'styled-components';
import AppContainer from './App';
import { vscode } from './common/vscode';
import reducer from './reducers';

require('./fonts/NeoLight.ttf');
require('./webview.scss');

const GlobalStyle = createGlobalStyle`

`;

const store = createStore(reducer);
store.subscribe(() => {
  vscode.setState(store.getState());
});

const StyledErrorWrapper = styled.div`
  width: 100%;
  padding: 80px;
`;

const root = createRoot(document.getElementById('root'));

window.onerror = (msg, url, line, col) => {
  root.render(
    <StyledErrorWrapper>
      <Callout title="Encountered error" icon="error" intent="danger">
        <br />
        {process.env.NODE_ENV === 'production' && (
          <p>
            Ooops the application has encountered an error it was not able to recover from. Please
            click the button below to reload the webview.
          </p>
        )}
        {process.env.NODE_ENV !== 'production' && (
          <>
            <p>The application encountered an error</p>
            <pre>
              <strong>Error: </strong>
              {msg}
            </pre>
            <pre>
              <strong>File: </strong>
              {url}
            </pre>
            <pre>
              <strong>Line: </strong>
              {line}, <strong>Col: </strong>
              {col}
            </pre>
          </>
        )}
        <br />
        <ButtonGroup>
          <AnchorButton
            intent="primary"
            icon="refresh"
            text="Reload webview"
            href="command:workbench.action.webview.reloadWebviewAction"
          />
        </ButtonGroup>
      </Callout>
    </StyledErrorWrapper>,
    document.querySelector('#root')
  );
};

root.render(
  <DndProvider backend={HTML5Backend}>
    <Provider store={store}>
      <AppContainer />
    </Provider>
  </DndProvider>
);
