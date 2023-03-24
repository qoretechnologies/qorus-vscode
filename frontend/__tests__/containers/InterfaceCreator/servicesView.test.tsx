import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MethodSelector } from '../../../src/containers/InterfaceCreator/servicesView';

describe('MethodSelector', () => {
  const onClickMock = jest.fn();
  const onRemoveClickMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <ReqoreUIProvider>
        <MethodSelector></MethodSelector>
      </ReqoreUIProvider>
    );
  });

  it('test selector renders correctly', () => {
    render(
      <ReqoreUIProvider>
        <MethodSelector onClick={onClickMock}>Test Selector</MethodSelector>
      </ReqoreUIProvider>
    );

    expect(screen.getAllByText(/Test Selector/i)[0]).toBeDefined();
  });

  it('calls the onClick function when clicked', () => {
    render(
      <ReqoreUIProvider>
        <MethodSelector onClick={onClickMock}>Test Selector</MethodSelector>
      </ReqoreUIProvider>
    );

    fireEvent.click(screen.getAllByText('Test Selector', { exact: false })[0]);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

});
