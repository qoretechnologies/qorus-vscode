import {
  ReqoreContent,
  ReqoreMessage,
  ReqoreP,
  ReqorePanel,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreUIProvider,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreUIProviderProps } from '@qoretechnologies/reqore/dist/containers/UIProvider';
import { darken, lighten } from 'polished';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import AppContainer from './App';
import { vscode } from './common/vscode';
import reducer from './reducers';

require('./fonts/NeoLight.ttf');

const store = createStore(reducer);
store.subscribe(() => {
  vscode.setState?.(store.getState());
});

const root = createRoot(document.getElementById('root'));

window.onerror = (msg, url, line, col) => {
  root.render(
    <ReqoreUIProvider
      theme={{ intents: { success: '#4a7110' } }}
      options={{
        animations: { buttons: false },
        closePopoversOnEscPress: true,
      }}
    >
      <ReqoreContent style={{ padding: '20px' }}>
        <ReqorePanel
          label="The application encountered an error"
          icon="ErrorWarningLine"
          intent="danger"
        >
          {process.env.NODE_ENV === 'production' && (
            <>
              <ReqoreP>
                The application has encountered an error it was not able to recover from. Please
                click the "Reload" below to reload the webview.
              </ReqoreP>
            </>
          )}
          {process.env.NODE_ENV !== 'production' && (
            <>
              <ReqorePanel minimal flat label="Error">
                {msg}
              </ReqorePanel>
              <ReqorePanel minimal flat label="File">
                {url}
              </ReqorePanel>
              <ReqorePanel minimal flat label="Location">
                <ReqoreTagGroup>
                  <ReqoreTag labelKey="Line" label={line} />
                  <ReqoreTag labelKey="Column" label={col} />
                </ReqoreTagGroup>
              </ReqorePanel>
            </>
          )}
          <ReqorePanel minimal flat>
            You can also open an issue on our GitHub repository: @qoretechnologies/qorus-vscode and
            include the message below.
            <ReqoreVerticalSpacer height={10} />
            <ReqoreMessage intent="danger">{msg}</ReqoreMessage>
          </ReqorePanel>
          <ReqoreVerticalSpacer height={10} />
          <a href="command:workbench.action.webview.reloadWebviewAction">Reload webview</a>
        </ReqorePanel>
      </ReqoreContent>
    </ReqoreUIProvider>
  );
};

export const ReqoreWrapper = ({
  reqoreOptions,
}: {
  reqoreOptions?: IReqoreUIProviderProps['options'];
}) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'vscode'>('vscode');

  return (
    <ReqoreUIProvider
      theme={{
        main: theme === 'light' ? '#ffffff' : '#222222',
        intents: { success: '#4a7110' },
        breadcrumbs: {
          main: theme === 'light' ? darken(0.1, '#ffffff') : lighten(0.1, '#222222'),
        },
        sidebar: theme === 'light' ? { main: '#333333' } : undefined,
        header: theme === 'light' ? { main: '#333333' } : undefined,
      }}
      options={{
        animations: { buttons: false },
        withSidebar: true,
        closePopoversOnEscPress: true,
        ...reqoreOptions,
      }}
    >
      <AppContainer theme={theme} setTheme={setTheme} />
    </ReqoreUIProvider>
  );
};

root.render(
  <DndProvider backend={HTML5Backend}>
    <Provider store={store}>
      <ReqoreWrapper />
    </Provider>
  </DndProvider>
);
