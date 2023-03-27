import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import {
  IClassConnection,
  IClassConnections,
  IClassConnectionsDraftData,
  IClassConnectionsManageDialog,
  IClassConnectionsManagerProps,
  StyledDialogBody,
} from '../../../src/containers/ClassConnectionsManager/index';

describe('IClassConnections test', () => {
  test('StyledDialogBody has the correct styling properties', () => {
    const { getByTestId } = render(<StyledDialogBody data-testid="dialog-body" />);
    const dialogBody = getByTestId('dialog-body');
    expect(dialogBody).toHaveStyle('padding: 20px 20px 0 20px;');
    expect(dialogBody).toHaveStyle('margin: 0;');
    expect(dialogBody).toHaveStyle('display: flex;');
    expect(dialogBody).toHaveStyle('height: 100%;');
    expect(dialogBody).toHaveStyle('width: 100%;');
  });
  test('IClassConnections has the correct interface', () => {
    const connections: IClassConnections = {
      class1: [
        { id: 1, name: 'connection1' },
        { id: 2, name: 'connection2' },
      ],
      class2: [{ id: 3, name: 'connection3' }],
    };
    expect(connections).toEqual({
      class1: [
        { id: 1, name: 'connection1' },
        { id: 2, name: 'connection2' },
      ],
      class2: [{ id: 3, name: 'connection3' }],
    });
  });
  test('IClassConnection has the correct interface', () => {
    const connection: IClassConnection = {
      class: 'class1',
      prefix: 'prefix1',
      connector: 'connector1',
      mapper: 'mapper1',
      trigger: 'trigger1',
      isLast: true,
      index: 0,
      isEditing: false,
      id: 1,
      additionalProperty: 'additionalValue',
    };
    expect(connection).toEqual({
      class: 'class1',
      prefix: 'prefix1',
      connector: 'connector1',
      mapper: 'mapper1',
      trigger: 'trigger1',
      isLast: true,
      index: 0,
      isEditing: false,
      id: 1,
      additionalProperty: 'additionalValue',
    });
  });
  test('IClassConnectionsManageDialog has the correct interface', () => {
    const dialog: IClassConnectionsManageDialog = {
      isOpen: true,
      name: 'dialog1',
      additionalProperty: 'additionalValue',
    };
    expect(dialog).toEqual({
      isOpen: true,
      name: 'dialog1',
      additionalProperty: 'additionalValue',
    });
  });
});
describe('IClassConnectionsManagerProps', () => {
  it('should have required properties', () => {
    const props: IClassConnectionsManagerProps = {
      classes: [],
      t: (key: string) => key,
      initialData: {},
      onSubmit: () => {},
      addMessageListener: () => {},
      postMessage: () => {},
      ifaceType: '',
    };

    expect(props).toHaveProperty('classes');
    expect(props).toHaveProperty('t');
    expect(props).toHaveProperty('initialData');
    expect(props).toHaveProperty('onSubmit');
    expect(props).toHaveProperty('addMessageListener');
    expect(props).toHaveProperty('postMessage');
    expect(props).toHaveProperty('ifaceType');
  });

  it('should allow optional properties', () => {
    const props: IClassConnectionsManagerProps = {
      classes: [],
      t: (key: string) => key,
      initialData: {},
      onSubmit: () => {},
      addMessageListener: () => {},
      postMessage: () => {},
      ifaceType: '',
      initialConnections: {},
      baseClassName: '',
      interfaceContext: '',
    };

    expect(props).toHaveProperty('initialConnections');
    expect(props).toHaveProperty('baseClassName');
    expect(props).toHaveProperty('interfaceContext');
  });
});

describe('IClassConnectionsDraftData', () => {
  it('should have required properties', () => {
    const data: IClassConnectionsDraftData = {
      connections: {},
      classesData: {},
      lastConnectorId: 0,
      lastConnectionId: 0,
    };

    expect(data).toHaveProperty('connections');
    expect(data).toHaveProperty('classesData');
    expect(data).toHaveProperty('lastConnectorId');
    expect(data).toHaveProperty('lastConnectionId');
  });
});
