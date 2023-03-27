import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { userEvent } from '@storybook/testing-library';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TTranslator } from '../../../src/App';
import { ManageConfigButton } from '../../../src/containers/ConfigItemManager/manageButton';
import { TMessageListener } from '../../../src/hocomponents/withMessageHandler';

describe('ConfigItemManager', () => {
  const myTranslator: TTranslator = (key) => {};

  const myMessageListener: TMessageListener = jest.fn();

  const myClickHandler = jest.fn();

  const myFetchCallFunction = () => {};
  const myProps = {
    t: myTranslator,
    addMessageListener: myMessageListener,
    disabled: false,
    onClick: myClickHandler,
    type: 'myType',
    fetchCall: myFetchCallFunction,
  };

  test('renders ManageConfigButton component without crashing', async () => {
    render(
      <ReqoreUIProvider>
        <ManageConfigButton {...myProps} />
      </ReqoreUIProvider>
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(myClickHandler).toHaveBeenCalledTimes(1);
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
