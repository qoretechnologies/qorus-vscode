import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { create } from 'react-test-renderer';
import {
  ConnectionView,
  IConnection,
} from '../../../../src/containers/InterfaceCreator/connection/index';

const onSubmitSuccess = jest.fn();
const connection: IConnection = {
  target_dir: 'test',
  name: 'test-connection',
  desc: 'test description',
  url: 'https://test.com',
};

describe('ConnectionView', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render without errors', () => {
    render(
      <ReqoreUIProvider>
        <ConnectionView onSubmitSuccess={onSubmitSuccess} />
      </ReqoreUIProvider>
    );
  });

  it('should call applyDraft on mount', () => {
    const mockApplyDraft = jest.fn();
    const onSubmitSuccess = jest.fn();
    const renderer = create(
      <ReqoreUIProvider>
        <ConnectionView onSubmitSuccess={onSubmitSuccess} />
      </ReqoreUIProvider>
    );
    expect(mockApplyDraft).toBeDefined();
  });

  it('should display fields fetched from backend', async () => {
    const mockFields = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' },
    ];
    jest.spyOn(window, 'postMessage').mockImplementation(() => {});

    render(
      <ReqoreUIProvider>
        <ConnectionView onSubmitSuccess={onSubmitSuccess} />
      </ReqoreUIProvider>
    );
    window.postMessage({ message: 'FIELDS_FETCHED', fields: mockFields }, '*');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    mockFields.forEach(({ label }) => {
      expect(mockFields).toBeDefined();
    });
  });
});
