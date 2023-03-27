import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { render } from '@testing-library/react';
import MapperOutput, { IMapperOutputProps } from '../../../src/containers/Mapper/output';

describe.skip('MapperOutput component', () => {
  const defaultProps: IMapperOutputProps = {
    onDrop: jest.fn(),
    id: 1,
    accepts: ['string'],
    name: 'Field 1',
    isChild: false,
    level: 0,
    onClick: jest.fn(),
    onManageClick: jest.fn(),
    lastChildIndex: 0,
    type: { base_type: 'string', types_returned: ['string'] },
    field: { desc: 'Field description' },
    isCustom: false,
    path: 'output.field1',
    hasRelation: false,
    highlight: false,
    t: jest.fn(),
    hasError: false,
  };

  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
  });
  
  it('displays the field name', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
  });

  it('displays the field type badge', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText(defaultProps.type.base_type)).toBeInTheDocument();
  });

  it('calls onClick when the field is clicked', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
    const field = screen.getByText(defaultProps.name);
    field.click();
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('calls onDrop when an input is dropped on the field', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
    const field = screen.getByTestId('mapper-field');
    const input = { id: 2, types: ['string'], usesContext: false, isWholeInput: false };
    field.dispatchEvent(
      new DragEvent('drop', { dataTransfer: { getData: () => JSON.stringify(input) } })
    );
    expect(defaultProps.onDrop).toHaveBeenCalledWith(
      input.id,
      defaultProps.path,
      input.usesContext,
      input.isWholeInput
    );
  });
});
