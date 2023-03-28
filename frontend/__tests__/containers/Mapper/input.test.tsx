import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import { userEvent } from '@storybook/testing-library';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as dnd from 'react-dnd';
import MapperInput, { IMapperInputProps } from '../../../src/containers/Mapper/input';

describe('MapperInput component', () => {
  const props: IMapperInputProps = {
    id: 1,
    field: {},
    types: [],
    name: '',
    isMapperChild: false,
    level: 0,
    isCustom: false,
    lastChildIndex: 0,
    onClick: jest.fn(),
    type: {},
    path: '',
    hasAvailableOutput: false,
    hasRelation: false,
    usesContext: false,
    isWholeInput: false,
    description: '',
    hasError: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(dnd, 'useDrag').mockImplementation(() => [100, undefined, jest.fn()]);
  });

  it('should render correctly', () => {

    render(
      <ReqoreUIProvider>
        <MapperInput {...props} />
      </ReqoreUIProvider>
    );
  });

  it('should render with a drag handle when hasAvailableOutput is true', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <MapperInput {...props} />
      </ReqoreUIProvider>
    );
    expect(
      container.getElementsByClassName('StyledMapperField__DragHandle-sc-1u6fxlz-0')
    ).toBeDefined();
  });

  it('should call the onClick function when clicked', () => {
    render(
      <ReqoreUIProvider>
        <MapperInput {...props} />
      </ReqoreUIProvider>
    );
    userEvent.click(screen.getAllByRole('button')[0]);
    expect(props.onClick).toHaveBeenCalled();
  });

  it('should render the name prop', () => {
     render(
      <ReqoreUIProvider>
        <MapperInput {...props} name="Test" />
      </ReqoreUIProvider>
    );
    expect(
      screen.getAllByText('Test')[0]
    ).toBeDefined();
  });
});
