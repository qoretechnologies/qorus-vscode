import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Messages } from '../../../src/constants/messages';
import { ManageConfigButton } from '../../../src/containers/ConfigItemManager/manageButton';
import { TTranslator } from '../../../src/App';
import { TMessageListener } from '../../../src/hocomponents/withMessageHandler';

describe('ConfigItemManager', () => {
  const myTranslator: TTranslator = (key) => {
  };

  const myMessageListener: TMessageListener = (message, handler) => {
  };

  const myClickHandler = () => {
  };

  const myFetchCallFunction = () => {
  };
  const myProps = {
    t: myTranslator,
    addMessageListener: myMessageListener,
    disabled: false,
    onClick: myClickHandler,
    type: 'myType',
    fetchCall: myFetchCallFunction,
  };
  test('renders ManageConfigButton component without crashing', () => {
    render(
      <ReqoreUIProvider>
        <ManageConfigButton {...myProps} />
      </ReqoreUIProvider>
    );
  });
  test('calls fetchCall prop when component mounts', () => {
    const fetchCall = jest.fn();
    render(
      <ReqoreUIProvider>
        <ManageConfigButton {...myProps} fetchCall={fetchCall} />
      </ReqoreUIProvider>
    );
    expect(fetchCall).toHaveBeenCalledTimes(1);
  });
});
