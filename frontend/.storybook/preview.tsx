import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
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
        <Story />
      </ReqoreUIProvider>
    ),
  ],
};

export default preview;
