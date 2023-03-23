import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Messages } from '../../../src/constants/messages';
import { ManageConfigButton } from '../../../src/containers/ConfigItemManager/manageButton';
import { TTranslator } from '../../../src/App';
import { TMessageListener } from '../../../src/hocomponents/withMessageHandler';

describe('ConfigItemManager', () => {
  const myTranslator: TTranslator = (key) => {
    // your translation function implementation
  };

  const myMessageListener: TMessageListener = (message, handler) => {
    // your message listener implementation
  };

  const myClickHandler = () => {
    // your click handler implementation
  };

  const myFetchCallFunction = () => {
    // your fetch call function implementation
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
