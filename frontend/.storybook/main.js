module.exports = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  features: {
    interactionsDebugger: true,
  },
  typescript: { reactDocgen: 'react-docgen' },
  env: (config) => ({
    ...config,
    NODE_ENV: 'test',
    BROWSER: 'chrome',
  }),
  refs: {
    reqore: {
      title: 'ReQore',
      url: 'https://reqore.qoretechnologies.com/',
    },
  },
};
