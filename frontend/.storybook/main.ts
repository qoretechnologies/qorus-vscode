const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm',
    '@chromaui/addon-visual-tests',
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
    NODE_ENV: 'storybook',
    BROWSER: 'chrome',
  }),
  webpackFinal: async (config) => {
    return {
      ...config,
      experiments: {
        ...config.experiments,
        topLevelAwait: true,
      },
    };
  },
  refs: {
    reqore: {
      title: 'ReQore',
      url: 'https://reqore.qoretechnologies.com/',
    },
  },
};

export default config;
