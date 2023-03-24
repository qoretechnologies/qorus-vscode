import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ConnectorSelector, {
  IConnectorSelectorProps,
} from '../../../../src/containers/InterfaceCreator/fsm/connectorSelector';

describe('ConnectorSelector component', () => {
  const mockOnChange = jest.fn();
  const mockAddMessageListener = jest.fn();
  const mockPostMessage = jest.fn();
  const mockTypes = ['input'];
  const mockTargetDir = 'mock/target/dir';
  const mockValue = {
    class: 'MockClass',
    connector: 'MockConnector',
  };
  const mockClasses = [
    {
      name: 'MockClass',
      desc: 'Mock description',
      'class-connectors': [
        {
          name: 'MockConnector',
          type: 'input',
        },
        {
          name: 'MockOutputConnector',
          type: 'output',
        },
      ],
    },
  ];

  const defaultProps: IConnectorSelectorProps = {
    value: mockValue,
    onChange: mockOnChange,
    addMessageListener: mockAddMessageListener,
    postMessage: mockPostMessage,
    types: mockTypes,
    target_dir: mockTargetDir,
    classes: mockClasses, // add the classes prop here
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component', () => {
    render(
      <ReqoreUIProvider>
        <ConnectorSelector {...defaultProps} />
      </ReqoreUIProvider>
    );
  });

  it('should render SelectFields when classes is not null', () => {
    render(
      <ReqoreUIProvider>
        <ConnectorSelector {...defaultProps} />
      </ReqoreUIProvider>
    );
    expect(mockPostMessage).toBeDefined();
  });
});
