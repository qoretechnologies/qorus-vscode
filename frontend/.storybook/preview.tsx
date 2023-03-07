import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '@qoretechnologies/reqore';
import { Preview } from '@storybook/react';

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
  },
  decorators: [
    (Story) => (
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent style={{ padding: '20px' }}>
            <Story />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    ),
  ],
};

export default preview;
