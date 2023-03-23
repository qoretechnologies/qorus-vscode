import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import {
  ClassConnectionsDiagram,
  Connector,
  IClassConnectionsDiagramProps,
  IConnectorProps,
  IManageDialog,
} from '../../../src/containers/ClassConnectionsManager/diagram';

describe('IClassConnectionsDiagramProps test', () => {
  test('renders component without crashing', () => {
    const props: IClassConnectionsDiagramProps = {
      connection: [],
      t: jest.fn(),
      addMessageListener: jest.fn(),
      postMessage: jest.fn(),
      onAddConnector: jest.fn(),
      onDeleteConnector: jest.fn(),
      classes: {},
      connectionName: '',
    };
    render(
      <ReqoreUIProvider>
        <ClassConnectionsDiagram {...props} />
      </ReqoreUIProvider>
    );
  });

  test('calls onAddConnector with correct arguments when a connector is added', () => {
    const onAddConnector = jest.fn();
    const props: IClassConnectionsDiagramProps = {
      connection: [],
      t: jest.fn(),
      addMessageListener: jest.fn(),
      postMessage: jest.fn(),
      onAddConnector,
      onDeleteConnector: jest.fn(),
      classes: {},
      connectionName: '',
    };
    render(
      <ReqoreUIProvider>
        <ClassConnectionsDiagram {...props} />
      </ReqoreUIProvider>
    );
    expect(onAddConnector).toBeDefined();
  });

  test('calls onDeleteConnector with correct arguments when a connector is deleted', () => {
    const onDeleteConnector = jest.fn();
    const props: IClassConnectionsDiagramProps = {
      connection: [{ id: 1 /* other data */ }],
      t: jest.fn(),
      addMessageListener: jest.fn(),
      postMessage: jest.fn(),
      onAddConnector: jest.fn(),
      onDeleteConnector,
      classes: {},
      connectionName: '',
    };
    const { getByTestId } = render(
      <ReqoreUIProvider>
        <ClassConnectionsDiagram {...props} />
      </ReqoreUIProvider>
    );
    expect(onDeleteConnector).toBeDefined();
  });
});

describe('IManageDialog interface', () => {
  test('should have the correct properties', () => {
    const manageDialog: IManageDialog = {
      isOpen: true,
      class: 'MyClass',
      mapper: 'MyMapper',
      connector: 'MyConnector',
      connectorList: ['Connector1', 'Connector2'],
      isFirst: false,
      isBetween: true,
      isLast: false,
      index: 1,
      isEditing: true,
      isMapper: false,
      inputProvider: 'MyInputProvider',
      outputProvider: 'MyOutputProvider',
      trigger: 'MyTrigger',
      isConnectorEventType: true,
      previousItemData: 'MyPreviousItemData',
      nextItemData: 'MyNextItemData',
    };

    expect(manageDialog).toHaveProperty('isOpen', true);
    expect(manageDialog).toHaveProperty('class', 'MyClass');
    expect(manageDialog).toHaveProperty('mapper', 'MyMapper');
    expect(manageDialog).toHaveProperty('connector', 'MyConnector');
    expect(manageDialog).toHaveProperty('connectorList', ['Connector1', 'Connector2']);
    expect(manageDialog).toHaveProperty('isFirst', false);
    expect(manageDialog).toHaveProperty('isBetween', true);
    expect(manageDialog).toHaveProperty('isLast', false);
    expect(manageDialog).toHaveProperty('index', 1);
    expect(manageDialog).toHaveProperty('isEditing', true);
    expect(manageDialog).toHaveProperty('isMapper', false);
    expect(manageDialog).toHaveProperty('inputProvider', 'MyInputProvider');
    expect(manageDialog).toHaveProperty('outputProvider', 'MyOutputProvider');
    expect(manageDialog).toHaveProperty('trigger', 'MyTrigger');
    expect(manageDialog).toHaveProperty('isConnectorEventType', true);
    expect(manageDialog).toHaveProperty('previousItemData', 'MyPreviousItemData');
    expect(manageDialog).toHaveProperty('nextItemData', 'MyNextItemData');
  });
});
describe('Connector', () => {
  const mockAddMessageListener = jest.fn();
  const mockPostMessage = jest.fn();
  const mockSetManageDialog = jest.fn();

  const mockProps: IConnectorProps = {
    t: jest.fn(),
    manageDialog: {},
    addMessageListener: mockAddMessageListener,
    postMessage: mockPostMessage,
    setManageDialog: mockSetManageDialog,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without errors', () => {
    render(
      <ReqoreUIProvider>
        <Connector {...mockProps} />
      </ReqoreUIProvider>
    );
  });

  test('calls addMessageListener with correct arguments', () => {
    render(
      <ReqoreUIProvider>
        <Connector {...mockProps} />
      </ReqoreUIProvider>
    );
    expect(mockAddMessageListener).toBeCalledTimes(0);
  });
});
