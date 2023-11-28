import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { Preview } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { basicAuthCredentials } from '../src/common/vscode';
import { InitialContext } from '../src/context/init';

const StorybookWrapper = ({ context, Story }) => {
  const confirmAction = useReqoreProperty('confirmAction');

  return (
    <ReqoreLayoutContent>
      <ReqoreContent style={{ padding: '20px', display: 'flex', flexFlow: 'column' }}>
        <DndProvider backend={HTML5Backend}>
          <InitialContext.Provider
            value={{
              qorus_instance: context.args.qorus_instance,
              confirmAction,
              saveDraft: () => {},
              fetchData: async (url, method) => {
                const data = await fetch(`https://hq.qoretechnologies.com:8092/api/latest/${url}`, {
                  method,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${btoa(basicAuthCredentials)}`,
                  },
                });

                const json = await data.json();

                return { data: json, ok: data.ok, error: !data.ok ? json : undefined };
              },
            }}
          >
            <Story />
          </InitialContext.Provider>
        </DndProvider>
      </ReqoreContent>
    </ReqoreLayoutContent>
  );
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    chromatic: {
      viewports: [800, 1440],
      pauseAnimationAtEnd: true,
    },
  },
  args: {
    qorus_instance: {
      url: 'https://hq.qoretechnologies.com:8092',
    },
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ReqoreUIProvider options={{ ...context.args.reqoreOptions }}>
        <StorybookWrapper context={context} Story={Story} />
      </ReqoreUIProvider>
    ),
  ],
};

export default preview;
