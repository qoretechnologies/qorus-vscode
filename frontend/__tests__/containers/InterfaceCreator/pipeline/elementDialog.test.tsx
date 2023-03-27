import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  CompatibilityCheckIndicator,
  PipelineElementDialog,
} from '../../../../src/containers/InterfaceCreator/pipeline/elementDialog';

const data = {
  type: 'mapper',
  name: 'Mapper1',
  children: [],
};
const parentData = {
  outputs: [
    {
      name: 'output_1',
      type: 'string',
      subtype: null,
    },
    {
      name: 'output_2',
      type: 'number',
      subtype: null,
    },
  ],
};

describe('CompatibilityCheckIndicator component', () => {
  it('renders the component', () => {
    render(
      <ReqoreUIProvider>
        <CompatibilityCheckIndicator isCompatible title="My Element" />
      </ReqoreUIProvider>
    );
  });
  it('renders the component with success message', () => {
    render(
      <ReqoreUIProvider>
        <CompatibilityCheckIndicator isCompatible title="My Element" />
      </ReqoreUIProvider>
    );
    const message = screen.getByText('My ElementCompatible');
    expect(message).toBeInTheDocument();
  });

  it('renders the component with warning message', () => {
    render(
      <ReqoreUIProvider>
        <CompatibilityCheckIndicator isCheckingCompatibility />
      </ReqoreUIProvider>
    );
    const message = screen.getByText(/CheckingCompatibility/i);
    expect(message).toBeInTheDocument();
  });

  it('renders the component with error message', () => {
    render(
      <ReqoreUIProvider>
        <CompatibilityCheckIndicator isCompatible={false} />
      </ReqoreUIProvider>
    );
    const message = screen.getByText(/PipelineElementIncompatible/i);
    expect(message).toBeInTheDocument();
  });
});

describe('PipelineElementDialog component', () => {
  const postMessageMock = jest.fn();
  const onSubmitMock = jest.fn();
  const onCloseMock = jest.fn();
  const inputProviderMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders PipelineElementDialog with the given props', () => {
    render(
      <ReqoreUIProvider>
        <PipelineElementDialog
          onClose={onCloseMock}
          data={data}
          parentData={parentData}
          onSubmit={onSubmitMock}
          interfaceId="interface-id"
          postMessage={postMessageMock}
          onlyQueue={false}
          inputProvider={inputProviderMock}
        />
      </ReqoreUIProvider>
    );

    const title = screen.getByText(/PipelineElement/i);
    expect(title).toBeInTheDocument();
  });

  it('should change pipeline element type', () => {
    render(
      <ReqoreUIProvider>
        <PipelineElementDialog
          onClose={onCloseMock}
          data={data}
          parentData={parentData}
          onSubmit={onSubmitMock}
          interfaceId="interface-id"
          postMessage={postMessageMock}
          onlyQueue={false}
          inputProvider={inputProviderMock}
        />
      </ReqoreUIProvider>
    );
    const typeDropdown = screen.getByText(/Type/i);
    expect(postMessageMock).not.toHaveBeenCalled();
  });
});
