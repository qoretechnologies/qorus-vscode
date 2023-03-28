import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { render, screen } from '@testing-library/react';
import MapperOutput, { IMapperOutputProps } from '../../../src/containers/Mapper/output';
import * as dnd from 'react-dnd';

describe('MapperOutput component', () => {
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
  beforeEach(() => {
    jest.spyOn(dnd, 'useDrop').mockImplementation(() => [100, jest.fn()]);
  });
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
    expect(screen.getAllByText(defaultProps.name)[0]).toBeDefined();
  });

  it('displays the field type badge', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText(defaultProps.type.base_type)).toBeDefined();
  });

  it('calls onClick when the field is clicked', () => {
    render(
      <ReqoreUIProvider>
        <MapperOutput {...defaultProps} />
      </ReqoreUIProvider>
    );
    const field = screen.getAllByText(defaultProps.name)[0];
    field.click();
    expect(defaultProps.onClick).toHaveBeenCalled();
  });
});