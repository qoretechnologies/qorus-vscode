import { ReqoreUIProvider, useReqoreTheme } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useDrag } from 'react-dnd';
import MapperInput, { IMapperInputProps } from '../../../src/containers/Mapper/input';
/*
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(),
}));

jest.mock('@qoretechnologies/reqore', () => ({
  useReqoreTheme: jest.fn(),
}));
*/
describe.skip('MapperInput component', () => {
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

  const theme = {};

  beforeEach(() => {
    (useDrag as jest.Mock).mockReturnValue([{ opacity: 1 }, jest.fn()]);
    (useReqoreTheme as jest.Mock).mockReturnValue(theme);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(
      <ReqoreUIProvider>
        <MapperInput {...props} />
      </ReqoreUIProvider>
    );
  });

  it('should render with a drag handle when hasAvailableOutput is true', () => {
    render(
      <ReqoreUIProvider>
        <MapperInput {...props} hasAvailableOutput={true} />
      </ReqoreUIProvider>
    );
    expect(container.querySelector('div')).toHaveClass(
      'StyledMapperField__DragHandle-sc-1u6fxlz-0'
    );
  });

  it('should call the onClick function when clicked', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <MapperInput {...props} />
      </ReqoreUIProvider>
    );
    container.querySelector('div')?.click();
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should render the name prop', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <MapperInput {...props} name="Test" />
      </ReqoreUIProvider>
    );
    expect(
      container.querySelector('.StyledMapperField__TextWrapper-sc-1u6fxlz-3')?.textContent
    ).toEqual('Test');
  });

  it('should render the badge with the correct color based on the type prop', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <MapperInput {...props} types={['<string>']} />
      </ReqoreUIProvider>
    );
    expect(container.querySelector('.StyledMapperField__BadgeWrapper-sc-1u6fxlz-5')).toHaveStyle(
      'background-color: #51b2fc'
    );
  });

  it('should render the badge with a * when types includes nothing', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <MapperInput {...props} types={['<nothing>']} />
      </ReqoreUIProvider>
    );
    expect(
      container.querySelector('.StyledMapperField__BadgeLabel-sc-1u6fxlz-7')?.textContent
    ).toEqual('*nothing');
  });
});
