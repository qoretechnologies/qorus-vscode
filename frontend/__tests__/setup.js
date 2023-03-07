global.console = {
  ...console,
  // uncomment to ignore a specific log level
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
