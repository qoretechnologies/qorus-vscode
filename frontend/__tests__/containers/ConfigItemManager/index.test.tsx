import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Messages } from '../../../src/constants/messages';
import {
  ConfigItemManager,
  IConfigItemManager,
} from '../../../src/containers/ConfigItemManager/index';

const postMessageMock = jest.fn();
const addMessageListenerMock = jest.fn();
const onUpdateMock = jest.fn();

const configItemManagerProps: IConfigItemManager = {
  t: jest.fn(),
  type: 'type',
  baseClassName: 'base-class-name',
  postMessage: postMessageMock,
  addMessageListener: addMessageListenerMock,
  interfaceId: 'interfaceId',
  definitionsOnly: false,
  disableAdding: false,
};

describe('ConfigItemManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it should render the component correctly', async () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemManager {...configItemManagerProps} />
      </ReqoreUIProvider>
    );
  });

  test('it should send a message to get the config items when mounting the component', async () => {
    render(
      <ReqoreUIProvider>
        <ConfigItemManager {...configItemManagerProps} />
      </ReqoreUIProvider>
    );
    await waitFor(() => {
      expect(postMessageMock).toHaveBeenCalledWith(
        Messages.GET_CONFIG_ITEMS,
        expect.objectContaining({
          'base-class-name': 'base-class-name',
          iface_id: 'interfaceId',
          iface_kind: 'type',
        })
      );
    });
  });


});
