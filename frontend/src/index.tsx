import { AnchorButton, ButtonGroup, Callout } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/table/lib/css/table.css';
import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { TReqoreHexColor } from '@qoretechnologies/reqore/dist/components/Effect';
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

const styles = getComputedStyle(document.querySelector('html')!);
let editorBackground: TReqoreHexColor = styles.getPropertyValue(
  '--vscode-editor-background'
) as TReqoreHexColor;
// Transform editorBackground to hex
if (editorBackground.startsWith('rgb')) {
  // Create RGB to Hex function
  const rgbToHex = (rgb: string) => {
    const [r, g, b] = rgb
      .replace(/[^\d,]/g, '')
      .split(',')
      .map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  editorBackground = rgbToHex(editorBackground) as TReqoreHexColor;
}

// if editorBackground hex has transparency, remove it
if (editorBackground.length === 9) {
  editorBackground = editorBackground.slice(0, 7) as TReqoreHexColor;
}

root.render(
  <DndProvider backend={HTML5Backend}>
    <Provider store={store}>
      <ReqoreUIProvider
        theme={{ main: '#222222', intents: { success: '#4a7110' } }}
        options={{ animations: { buttons: false }, withSidebar: true, tooltips: { delay: 200 } }}
      >
        <AppContainer />
      </ReqoreUIProvider>
    </Provider>
  </DndProvider>
);
