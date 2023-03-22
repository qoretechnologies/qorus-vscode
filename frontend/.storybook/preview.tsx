import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '@qoretechnologies/reqore';
import { Preview } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { InitialContext } from '../src/context/init';

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
    qorus_instance: true,
  },
  decorators: [
    (Story, context) => (
      <ReqoreUIProvider options={{ ...context.args.reqoreOptions }}>
        <ReqoreLayoutContent>
          <ReqoreContent style={{ padding: '20px', display: 'flex', flexFlow: 'column' }}>
            <DndProvider backend={HTML5Backend}>
              <InitialContext.Provider
                value={{
                  qorus_instance: context.args.qorus_instance,
                  saveDraft: () => {},
                  fetchData: async (url, method) => {
                    const data = await fetch(
                      `https://sandbox.qoretechnologies.com/api/latest/${url}`,
                      {
                        method,
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Basic ${btoa('sandbox:sandbox')}`,
                        },
                      }
                    );

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
      </ReqoreUIProvider>
    ),
  ],
};

export default preview;
